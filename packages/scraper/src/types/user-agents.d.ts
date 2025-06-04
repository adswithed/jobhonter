declare module 'user-agents' {
  interface UserAgentOptions {
    deviceCategory?: string;
    platform?: string;
  }

  class UserAgent {
    constructor(options?: UserAgentOptions | string);
    toString(): string;
    data: {
      userAgent: string;
      platform: string;
      appName: string;
      appVersion: string;
      vendor: string;
      vendorVersion: string;
      browserName: string;
      browserVersion: string;
      engine: string;
      engineVersion: string;
      os: string;
      osVersion: string;
      deviceModel: string;
      deviceType: string;
      deviceVendor: string;
      cpu: string;
    };
  }

  export = UserAgent;
} 