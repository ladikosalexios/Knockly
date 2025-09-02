class MatchingService
  def self.score(applicant_profile:, job_description:, job_requirements:)
    return { score: nil, reason: "Missing job description", breakdown: {}, explanation: nil } if job_description.nil?

    if applicant_profile.embedding.present? && job_description.embedding.present?
      score_with_embeddings(applicant_profile: applicant_profile, job_description: job_description)
    else
      semantic_score_with_gpt(
        applicant_profile: applicant_profile,
        job_description: job_description.description,
        job_requirements: job_requirements
      )
    end
  end

  def self.score_with_embeddings(applicant_profile:, job_description:)
    a = applicant_profile.embedding
    b = job_description.embedding
    return { score: nil, reason: "Missing embeddings", breakdown: {}, explanation: nil } if a.nil? || b.nil?

    dot = a.zip(b).sum { |x, y| x * y }
    norm_a = Math.sqrt(a.sum { |x| x * x })
    norm_b = Math.sqrt(b.sum { |y| y * y })
    return { score: nil, reason: "Missing embeddings", breakdown: {}, explanation: nil } if norm_a.zero? || norm_b.zero?
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

    breakdown = {
      skill_overlap: skill_overlap_score(applicant_profile, job_description),
      experience: experience_score(applicant_profile, job_description),
      location: location_score(applicant_profile, job_description)
    }

    { score: (cosine_similarity * 100).round, reason: reason, breakdown: breakdown, explanation: nil }
  end

  def self.semantic_score_with_gpt(applicant_profile:, job_description:, job_requirements:)
    client = OPENAI_CLIENT

    prompt = <<~PROMPT
      You are a helpful AI assistant skilled in evaluating job fit between a candidate and a job.

      Based on the candidate profile and the job posting below, return a JSON with:
      - score: a number between 0 and 100 representing how well the candidate fits the job
      - reason: 1-2 sentence justification
      - breakdown: object with numeric fields skill_overlap, experience, location (each 0-100)
      - explanation: short paragraph explaining the breakdown

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

      Please respond only in JSON with keys: score, reason, breakdown, explanation.
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
    { score: nil, reason: "Unable to evaluate match at this time.", breakdown: {}, explanation: nil }
  end

  def self.skill_overlap_score(applicant_profile, job_description)
    return nil unless applicant_profile.respond_to?(:skills) && job_description.respond_to?(:skills)
    applicant_skills = Array(applicant_profile.skills).map { |s| s.respond_to?(:name) ? s.name : s }
    job_skills = Array(job_description.skills).map { |s| s.respond_to?(:name) ? s.name : s }
    return nil if applicant_skills.empty? || job_skills.empty?

    overlap = applicant_skills & job_skills
    ((overlap.length.to_f / job_skills.length) * 100).round
  end

  def self.experience_score(applicant_profile, job_description)
    return nil unless applicant_profile.respond_to?(:total_years_experience)
    years = applicant_profile.total_years_experience
    required = extract_years(job_description.try(:requirements))
    return nil if years.nil? || required.nil? || required.zero?

    ratio = [years.to_f / required, 1.0].min
    (ratio * 100).round
  end

  def self.location_score(applicant_profile, job_description)
    return 100 if job_description.respond_to?(:is_remote) && job_description.is_remote
    job_loc = job_description.respond_to?(:location) ? job_description.location : nil
    applicant_loc = applicant_profile.respond_to?(:location) ? applicant_profile.location : nil
    return nil if job_loc.blank? || applicant_loc.blank?

    job_loc.to_s.downcase.strip == applicant_loc.to_s.downcase.strip ? 100 : 0
  end

  def self.extract_years(text)
    return nil if text.nil?
    match = text.match(/(\d+)\+?\s+years?/i)
    match[1].to_i if match
  end
end
