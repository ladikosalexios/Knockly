class MatchingService
  # Compute an overall match score between an applicant and a job description.
  #
  # The score is a weighted combination of several sub-scores:
  # - skills/semantic similarity (existing behaviour)
  # - experience years match
  # - location proximity
  # - required certifications match
  #
  # Recruiters can tune the importance of each factor by passing a `weights`
  # hash. Any missing weight falls back to a sensible default.
  def self.score(applicant_profile:, job_description:, job_requirements:, weights: {})
    return { score: nil, reason: "Missing job description" } if job_description.nil?

    weights = {
      skills: 0.5,
      experience: 0.25,
      location: 0.15,
      certifications: 0.1
    }.merge(weights || {})

    skill_data = if applicant_profile.embedding.present? && job_description.embedding.present?
                   score_with_embeddings(applicant_profile: applicant_profile, job_description: job_description)
                 else
                   semantic_score_with_gpt(
                     applicant_profile: applicant_profile,
                     job_description: job_description.description,
                     job_requirements: job_requirements
                   )
                 end
    skill_score = skill_data[:score] || 0

    experience_score = experience_match_score(
      applicant_profile&.total_years_experience,
      job_description&.years_experience_min,
      job_description&.years_experience_max
    )

    location_score = location_match_score(
      applicant_profile&.location,
      job_description&.location,
      job_description&.is_remote
    )

    certification_score = certification_match_score(
      applicant_profile&.certifications,
      job_requirements
    )

    total_weight = weights.values.sum
    combined_score = (
      skill_score * weights[:skills] +
      experience_score * weights[:experience] +
      location_score * weights[:location] +
      certification_score * weights[:certifications]
    ) / total_weight

    { score: combined_score.round, reason: skill_data[:reason] }
  end

  def self.score_with_embeddings(applicant_profile:, job_description:)
    a = applicant_profile.embedding
    b = job_description.embedding
    return { score: nil, reason: "Missing embeddings" } if a.nil? || b.nil?

    dot = a.zip(b).sum { |x, y| x * y }
    norm_a = Math.sqrt(a.sum { |x| x * x })
    norm_b = Math.sqrt(b.sum { |y| y * y })
    return { score: nil, reason: "Missing embeddings" } if norm_a.zero? || norm_b.zero?
    cosine_similarity = dot / (norm_a * norm_b)

    reason = case cosine_similarity
             when 0.9..1.0
               "Perfect match — you'd be hard-pressed to find a better fit."
             when 0.75..0.9
               "Strong match — the candidate aligns well, though not flawlessly."
             when 0.5..0.75
               "Average fit — some promising overlaps but room for improvement."
             else
               "Weak match — the connection feels tenuous at best."
             end

    { score: (cosine_similarity * 100).round, reason: reason }
  end

  def self.semantic_score_with_gpt(applicant_profile:, job_description:, job_requirements:)
    client = OPENAI_CLIENT

    prompt = <<~PROMPT
      You are a helpful AI assistant skilled in evaluating job fit between a candidate and a job.

      Based on the candidate profile and the job posting below, return a JSON with:
      - score: a number between 0 and 100 representing how well the candidate fits the job
      - reason: 1-2 sentence justification

      Candidate Profile:
      Skills: #{applicant_profile.skills.map(&:name).join(', ')}
      Education:
      #{applicant_profile.applicant_educations.map { |edu| "- #{edu.degree}, #{edu.school}" }.join("\n")}

      Work Experience:
      #{applicant_profile.applicant_experiences.map { |exp| "- #{exp.job_title} at #{exp.company_name}: #{exp.description}" }.join("\n")}

      Job Description:
      #{job_description}

      Job Requirements:
      #{job_requirements}

      Please respond only in JSON with 'score' and 'reason' keys.
    PROMPT

    Rails.logger.info "[MatchingService] Prompt:\n#{prompt}"

    response = client.chat(
      parameters: {
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4
      }
    )

    output = response.dig("choices", 0, "message", "content")

    Rails.logger.info "[MatchingService] GPT raw output: #{output}"

    JSON.parse(output, symbolize_names: true)
  rescue => e
    Rails.logger.warn "[MatchingService] Failed to compute match score: #{e.message}"
    { score: nil, reason: "Unable to evaluate match at this time." }
  end

  # --------------------
  # Scoring helpers
  # --------------------
  def self.experience_match_score(candidate_years, min_years, max_years)
    return 0 if candidate_years.nil? && min_years.nil? && max_years.nil?
    return 0 if candidate_years.nil?

    min_years ||= 0
    return 100 if candidate_years >= min_years

    [(candidate_years.to_f / min_years) * 100, 0].max
  end

  def self.location_match_score(candidate_location, job_location, is_remote)
    return 100 if is_remote
    return 0 if candidate_location.to_s.strip.empty? || job_location.to_s.strip.empty?

    candidate_location.to_s.strip.downcase == job_location.to_s.strip.downcase ? 100 : 0
  end

  def self.certification_match_score(candidate_certs, job_requirements)
    required = if job_requirements.is_a?(Hash)
                 Array(job_requirements[:required_certifications])
               else
                 []
               end
    return 0 if required.empty?

    candidate = Array(candidate_certs).map { |c| c.to_s.downcase }
    matched = required.count { |r| candidate.include?(r.to_s.downcase) }
    (matched.to_f / required.size) * 100
  end
end
