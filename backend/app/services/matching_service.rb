class MatchingService
  def self.score(applicant_profile:, job_description:, job_requirements:)
    return { score: nil, reason: "Missing job description" } if job_description.nil?

    result = if applicant_profile.embedding.present? && job_description.embedding.present?
               score_with_embeddings(applicant_profile: applicant_profile, job_description: job_description)
             else
               semantic_score_with_gpt(
                 applicant_profile: applicant_profile,
                 job_description: job_description.description,
                 job_requirements: job_requirements
               )
             end

    if result[:score] && applicant_profile.respond_to?(:job_applications)
      feedbacks = applicant_profile.job_applications.map(&:fit_feedback).compact
      if feedbacks.any?
        avg = feedbacks.sum.to_f / feedbacks.size
        result[:score] = (result[:score] + avg).clamp(0, 100).round
      end
    end
    result
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
end
