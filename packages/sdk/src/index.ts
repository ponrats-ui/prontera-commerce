export interface PronteraSdkOptions {
  baseUrl: string;
}

export class PronteraSdk {
  constructor(private readonly options: PronteraSdkOptions) {}

  get baseUrl() {
    return this.options.baseUrl;
  }
}
