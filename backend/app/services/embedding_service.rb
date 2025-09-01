class EmbeddingService
  # Generate an embedding vector for the given text using OpenAI.
  def self.generate(text)
    client = OpenAI::Client.new(access_token: ENV["OPENAI_API_KEY"])
    response = client.embeddings(parameters: {
      model: "text-embedding-ada-002",
      input: text
    })
    response.dig("data", 0, "embedding")
  end

  # Compute cosine similarity between two numeric vectors.
  # NOTE: Performance could be improved by caching normalized vectors or
  # using a database index (e.g., pgvector).
  def self.cosine_similarity(a, b)
    return 0.0 if a.blank? || b.blank?

    dot = a.zip(b).sum { |x, y| x.to_f * y.to_f }
    norm_a = Math.sqrt(a.sum { |x| x.to_f**2 })
    norm_b = Math.sqrt(b.sum { |y| y.to_f**2 })
    return 0.0 if norm_a.zero? || norm_b.zero?

    dot / (norm_a * norm_b)
  end
end
