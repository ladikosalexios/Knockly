class AnalyticsSnapshotJob < ApplicationJob
  queue_as :default

  def perform
    stage_counts = JobApplication.group(:status).count.transform_keys do |status|
      JobApplication.statuses.key(status) || status
    end

    snapshot = AnalyticsSnapshot.find_or_initialize_by(date: Date.current)
    snapshot.stage_counts = stage_counts
    snapshot.conversion_rates = conversion_rates(stage_counts)
    snapshot.median_stage_times = median_stage_times
    snapshot.save!
  end

  private

  def conversion_rates(stage_counts)
    stages = JobApplication.statuses.keys - ["rejected"]
    stages.each_cons(2).each_with_object({}) do |(prev, nxt), rates|
      prev_count = stage_counts[prev].to_f
      rates["#{prev}_to_#{nxt}"] = prev_count.zero? ? 0.0 : stage_counts[nxt].to_f / prev_count
    end
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
