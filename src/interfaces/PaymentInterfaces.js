/**
 * Payment-related interfaces and type definitions
 */

/**
 * @typedef {Object} PaymentRequest
 * @property {string} amount - Payment amount as string
 * @property {string} asset - Asset type (USDC, ETH, etc.)
 * @property {string} to - Recipient address or service identifier
 * @property {string} [memo] - Optional payment memo
 * @property {Object} [metadata] - Optional metadata object
 */

/**
 * @typedef {Object} PaymentReceipt
 * @property {boolean} valid - Whether payment is valid
 * @property {string} txHash - Transaction hash
 * @property {string} amount - Payment amount
 * @property {string} asset - Asset type
 * @property {string} from - Sender address
 * @property {string} to - Recipient address
 * @property {number} blockNumber - Block number of transaction
 * @property {string} [service] - Service identifier
 * @property {Object} [metadata] - Payment metadata
 * @property {string} [jobId] - Associated job ID
 * @property {string} [reason] - Reason for invalidity (if valid=false)
 */

/**
 * @typedef {Object} Transaction
 * @property {string} hash - Transaction hash
 * @property {string} amount - Transaction amount
 * @property {string} asset - Asset type
 * @property {string} from - Sender address
 * @property {string} to - Recipient address
 * @property {number} timestamp - Transaction timestamp
 * @property {Object} [metadata] - Transaction metadata
 * @property {Object} [signer] - Signer object for proof generation
 */

/**
 * @typedef {Object} Job
 * @property {string} id - Unique job identifier
 * @property {string} type - Job type
 * @property {Object} config - Job configuration
 * @property {string} status - Job status (pending, running, completed, failed)
 * @property {Object} [result] - Job execution result
 * @property {number} [startTime] - Job start timestamp
 * @property {number} [endTime] - Job end timestamp
 */

/**
 * @typedef {Object} AgentNode
 * @property {string} id - Node identifier
 * @property {string} endpoint - Node API endpoint
 * @property {number} load - Current load (0-100)
 * @property {string[]} capabilities - List of capabilities
 * @property {boolean} available - Whether node is available
 */

/**
 * @typedef {Object} PaymentSplit
 * @property {string} to - Recipient address
 * @property {string} amount - Split amount
 * @property {string} asset - Asset type
 * @property {number} share - Percentage share (0-100)
 * @property {string} memo - Payment memo
 */

/**
 * @typedef {Object} AuditLogEntry
 * @property {string} jobId - Job identifier
 * @property {string} txHash - Transaction hash
 * @property {string} status - Status (completed, failed)
 * @property {number} timestamp - Timestamp
 * @property {Object} [result] - Result data
 * @property {string} [error] - Error message (if failed)
 * @property {string} service - Service name
 * @property {string} version - Service version
 */

export const PaymentInterfaces = {
  PaymentRequest: /** @type {PaymentRequest} */ ({}),
  PaymentReceipt: /** @type {PaymentReceipt} */ ({}),
  Transaction: /** @type {Transaction} */ ({}),
  Job: /** @type {Job} */ ({}),
  AgentNode: /** @type {AgentNode} */ ({}),
  PaymentSplit: /** @type {PaymentSplit} */ ({}),
  AuditLogEntry: /** @type {AuditLogEntry} */ ({})
}

