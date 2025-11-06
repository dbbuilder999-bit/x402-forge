/**
 * x402 Client SDK
 * Main client for making payment-enabled API requests
 */

export class x402Client {
  constructor(config = {}) {
    this.baseURL = config.baseURL
    this.wallet = config.wallet
    this.defaultTimeout = config.timeout || 30000
  }

  /**
   * Make a payment-enabled fetch request
   * @param {string} url - Request URL
   * @param {Object} options - Fetch options
   * @param {string} [options.payment] - Payment amount and asset (e.g., "0.5 USDC")
   * @param {number} [options.deadline] - Payment deadline timestamp
   * @returns {Promise<Response>} Fetch response
   */
  async fetch(url, options = {}) {
    const { payment, deadline, ...fetchOptions } = options
    
    // Build headers
    const headers = {
      ...fetchOptions.headers,
      'Content-Type': 'application/json'
    }

    // Add payment header if provided
    if (payment) {
      headers['X-402-Payment'] = payment
      
      if (deadline) {
        headers['X-402-Deadline'] = deadline.toString()
      } else {
        // Default deadline: 30 seconds from now
        headers['X-402-Deadline'] = (Date.now() + 30000).toString()
      }
    }

    // Add authorization if wallet is available
    if (this.wallet && this.wallet.address) {
      headers['Authorization'] = `Bearer ${await this.getAuthToken()}`
    }

    // Make request with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.defaultTimeout)

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout')
      }
      
      throw error
    }
  }

  /**
   * Get a job by ID
   * @param {string} jobId - Job identifier
   * @returns {Promise<Object>} Job object
   */
  async getJob(jobId) {
    const response = await this.fetch(`${this.baseURL}/jobs/${jobId}`, {
      method: 'GET'
    })

    if (!response.ok) {
      throw new Error(`Failed to get job: ${response.statusText}`)
    }

    const jobData = await response.json()
    
    return {
      id: jobData.id,
      type: jobData.type,
      config: jobData.config,
      status: jobData.status,
      run: async () => {
        const runResponse = await this.fetch(`${this.baseURL}/jobs/${jobId}/run`, {
          method: 'POST'
        })
        return runResponse.json()
      },
      setContext: (context) => {
        jobData.context = context
      }
    }
  }

  /**
   * Log an audit entry
   * @param {Object} entry - Audit log entry
   * @returns {Promise<Object>} Audit log result
   */
  async logAudit(entry) {
    const response = await this.fetch(`${this.baseURL}/audit`, {
      method: 'POST',
      body: JSON.stringify(entry)
    })

    return response.json()
  }

  /**
   * Get authentication token
   * @returns {Promise<string>} Auth token
   */
  async getAuthToken() {
    // Implementation would generate or retrieve auth token
    return 'auth_token_' + Date.now()
  }
}

// Export singleton instance
export const x402 = new x402Client({
  baseURL: process.env.X402_API_URL || 'https://api.x402.org'
})

