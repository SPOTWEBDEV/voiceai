// Provider abstraction interfaces — swap Twilio/OpenAI for other providers later

export interface TelephonyProvider {
  initiateCall(params: { to: string; from: string; webhookUrl: string }): Promise<{ sid: string }>;
}

export interface SpeechProvider {
  transcribe(audio: Buffer): Promise<string>;
}

export interface VoiceProvider {
  synthesize(text: string, voice?: string): Promise<Buffer>;
}

export interface VoiceEngineConfig {
  telephony: TelephonyProvider;
  speech: SpeechProvider;
  voice: VoiceProvider;
}
