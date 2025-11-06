/**
 * Task Orchestrator Service
 * Coordinates agent-to-agent payments and service calls
 */

export class TaskOrchestrator {
  constructor(config = {}) {
    this.wallet = config.wallet
    this.network = config.network || process.env.X402_NETWORK || 'mainnet'
    this.rpcUrl = config.rpcUrl || process.env.RPC_URL
    this.defaultConfirmations = config.confirmations || 2
  }

  /**
   * Request a render service from another agent
   * @param {Object} config - Render service configuration
   * @param {string} config.chartType - Type of chart to render
   * @param {Object} config.data - Data to render
   * @param {string} config.format - Output format (png, svg, etc.)
   * @returns {Promise<Object>} Payment and job information
   */
  async requestRenderService(config) {
    const { chartType, data, format } = config
    
    try {
      // Create payment transaction
      const paymentTx = await this.wallet.pay({
        to: 'forge.network/render',
        amount: '3.5', // USDC
        asset: 'USDC',
        memo: `Render ${chartType} chart for analytics v3`,
        metadata: {
          jobId: crypto.randomUUID(),
          service: 'render',
          params: { format, quality: 'high' }
        }
      })

      console.log('Payment transaction:', paymentTx.hash)
      
      // Wait for confirmation
      const receipt = await paymentTx.wait({ confirmations: this.defaultConfirmations })
      
      if (receipt.status === 'confirmed') {
        console.log('Payment confirmed:', receipt.blockNumber)
        
        // Notify render service agent
        await this.notifyRenderAgent({
          txHash: paymentTx.hash,
          jobId: paymentTx.metadata.jobId,
          data,
          config: { chartType, format }
        })
        
        return { 
          success: true, 
          txHash: paymentTx.hash, 
          jobId: paymentTx.metadata.jobId 
        }
      } else {
        throw new Error('Payment confirmation failed')
      }
    } catch (error) {
      console.error('Render service payment failed:', error)
      throw error
    }
  }

  /**
   * Notify an agent about a payment and job request
   * @param {Object} payload - Notification payload
   * @returns {Promise<Object>} Agent response
   */
  async notifyRenderAgent(payload) {
    const response = await fetch('https://forge.network/render/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    
    if (!response.ok) {
      throw new Error(`Agent notification failed: ${response.statusText}`)
    }
    
    return response.json()
  }

  /**
   * Request data processing service
   * @param {Object} config - Processing configuration
   * @returns {Promise<Object>} Service result
   */
  async requestDataProcessing(config) {
    const { dataSource, operation, outputFormat } = config
    
    const paymentTx = await this.wallet.pay({
      to: 'forge.network/process',
      amount: '2.0',
      asset: 'USDC',
      memo: `Process ${operation} on ${dataSource}`,
      metadata: {
        jobId: crypto.randomUUID(),
        service: 'process',
        params: { operation, outputFormat }
      }
    })

    const receipt = await paymentTx.wait({ confirmations: this.defaultConfirmations })
    
    if (receipt.status === 'confirmed') {
      return {
        success: true,
        txHash: paymentTx.hash,
        jobId: paymentTx.metadata.jobId
      }
    }
    
    throw new Error('Processing payment failed')
  }
}

