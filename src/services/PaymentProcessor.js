/**
 * Payment Processor Service
 * Handles payment verification and job execution
 */

export class PaymentProcessor {
  constructor(config = {}) {
    this.verifier = config.verifier
    this.network = config.network || process.env.X402_NETWORK || 'mainnet'
    this.rpcUrl = config.rpcUrl || process.env.RPC_URL
    this.timeout = config.timeout || 60000
  }

  /**
   * Process a payment request and execute the associated job
   * @param {string} txHash - Transaction hash of the payment
   * @param {Object} jobConfig - Configuration for the job
   * @returns {Promise<Object>} Result of payment processing and job execution
   */
  async processPaymentRequest(txHash, jobConfig) {
    try {
      // Verify payment on-chain
      const receipt = await this.verifier.verify({
        txHash,
        expectedAmount: jobConfig.amount,
        expectedAsset: jobConfig.asset || 'USDC',
        timeout: this.timeout
      })

      if (!receipt.valid) {
        console.error('❌ Payment invalid or expired:', receipt.reason)
        return { success: false, error: receipt.reason }
      }

      console.log('✅ Verified payment for', receipt.service)
      console.log('Amount:', receipt.amount, receipt.asset)
      console.log('From:', receipt.from)
      console.log('Block:', receipt.blockNumber)

      // Extract job metadata from payment memo
      const jobId = receipt.metadata?.jobId || receipt.jobId
      
      if (!jobId) {
        throw new Error('No job ID found in payment metadata')
      }

      // Execute the job
      const result = await this.executeJob(jobId, jobConfig)
      
      // Log audit trail
      await this.logAudit({
        jobId,
        txHash,
        status: 'completed',
        timestamp: Date.now(),
        result
      })

      return { success: true, jobId, result }
    } catch (error) {
      console.error('Payment processing failed:', error)
      await this.logAudit({
        txHash,
        status: 'failed',
        error: error.message
      })
      throw error
    }
  }

  /**
   * Execute a job by ID
   * @param {string} jobId - Unique job identifier
   * @param {Object} config - Job configuration
   * @returns {Promise<Object>} Job execution result
   */
  async executeJob(jobId, config) {
    const job = await this.getJob(jobId)
    
    if (!job) {
      throw new Error(`Job ${jobId} not found`)
    }

    // Set job context
    job.setContext({
      config,
      startTime: Date.now()
    })

    // Execute with timeout
    const result = await Promise.race([
      job.run(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Job timeout')), 300000)
      )
    ])

    console.log('Job completed successfully:', jobId)
    return result
  }

  /**
   * Retrieve a job by ID
   * @param {string} jobId - Job identifier
   * @returns {Promise<Object>} Job object
   */
  async getJob(jobId) {
    // Implementation would fetch from job registry
    throw new Error('getJob not implemented')
  }

  /**
   * Log audit trail entry
   * @param {Object} entry - Audit log entry
   */
  async logAudit(entry) {
    // Implementation would send to audit service
    console.log('Audit log:', entry)
  }
}

