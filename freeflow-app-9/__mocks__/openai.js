class MockOpenAI {
  constructor(config) {
    this.apiKey = config?.apiKey
    this.chat = {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: 'Mocked OpenAI response'
              }
            }
          ]
        })
      }
    }
    this.audio = {
      transcriptions: {
        create: jest.fn().mockResolvedValue({
          text: 'Mocked transcription'
        })
      }
    }
  }
}

module.exports = {
  OpenAI: MockOpenAI
} 