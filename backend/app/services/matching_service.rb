class MatchingService
  def self.score(applicant_profile:, job_description:, job_requirements:)
    client = OpenAI::Client.new(access_token: ENV["OPENAI_API_KEY"])

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