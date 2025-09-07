class Api::AnalyticsController < ApplicationController
  before_action :require_admin!

  # GET /api/analytics
  def index
    data = Rails.cache.fetch("analytics_summary", expires_in: 10.minutes) do
      stage_counts = JobApplication.group(:status).count.transform_keys do |status|
        JobApplication.statuses.key(status) || status
      end

      conversion_rates = conversion_rates(stage_counts)
      median_times = median_stage_times

      snapshot = AnalyticsSnapshot.find_or_initialize_by(date: Date.current)
      snapshot.stage_counts = stage_counts
      snapshot.conversion_rates = conversion_rates
      snapshot.median_stage_times = median_times
      snapshot.save!

      {
        users_count: User.count,
        companies_count: Company.count,
        jobs_count: Job.count,
        job_applications_count: JobApplication.count,
        avg_job_post_lifespan: average_job_lifespan,
        avg_application_processing_time: average_application_processing_time,
        job_status_distribution: Job.group(:status).count,
        application_status_distribution: stage_counts,
        stage_counts: stage_counts,
        conversion_rates: conversion_rates,
        median_stage_times: median_times
      }
    end

    render json: data
  end

  private

  def average_job_lifespan
    Job.where.not(expires_at: nil)
       .average("EXTRACT(EPOCH FROM (expires_at - created_at))")
       .to_f
  end

  def average_application_processing_time
    JobApplication.average("EXTRACT(EPOCH FROM (updated_at - created_at))")
                  .to_f
  end

  def conversion_rates(stage_counts)
    stages = JobApplication.statuses.keys - ["rejected"]
    rates = {}
    stages.each_cons(2) do |prev, nxt|
      prev_count = stage_counts[prev].to_f
      rates["#{prev}_to_#{nxt}"] = prev_count.zero? ? 0.0 : stage_counts[nxt].to_f / prev_count
    end
    rates
  end

  def median_time_to_status(status)
    sql = JobApplication
          .where(status: JobApplication.statuses[status])
          .select("PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (updated_at - created_at))) AS median")
          .to_sql
    ActiveRecord::Base.connection.select_value(sql).to_f
  end

  def median_stage_times
    times = {}
    previous = 0.0
    (JobApplication.statuses.keys - ["submitted"]).each do |status|
      cumulative = median_time_to_status(status)
      times[status] = cumulative - previous
      previous = cumulative
    end
    times
  end
end

