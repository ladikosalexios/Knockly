class Api::MatchingController < ApplicationController
  # not yet but will construct
  def show
    client = OpenAI::Client.new(access_token: ENV["OPENAI_API_KEY"])

    response = client.chat(
      parameters: {
        model: "gpt-3.5-turbo",
        messages: [ { role: "user", content: "Say hello from the candidate matching route!" } ]
      }
    )

    message = response.dig("choices", 0, "message", "content")
    render json: { result: message }
  end
end
