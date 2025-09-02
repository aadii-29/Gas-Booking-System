const mongoose = require('mongoose');

/**
 * Handles MongoDB E11000 duplicate key errors by dropping the offending index and retrying the operation.
 * @param {Function} operation - The Mongoose operation to execute (e.g., model.save, Model.create).
 * @param {Object} model - The Mongoose model instance or constructor.
 * @param {number} [maxRetries=1] - Maximum number of retries after dropping the index.
 * @returns {Promise} - The result of the operation.
 */
async function handleDuplicateKeyError(operation, model, maxRetries = 1) {
  let retries = 0;

  while (retries <= maxRetries) {
    try {
      // Execute the operation
      return await operation();
    } catch (error) {
      if (error.code === 11000 && retries < maxRetries) {
        console.error('E11000 duplicate key error detected:', {
          message: error.message,
          index: error.keyPattern,
          collection: model.collection ? model.collection.collectionName : model.modelName
        });

        // Extract the index name from the error message
        const errorMessage = error.message || '';
        const indexMatch = errorMessage.match(/index: (\S+)/);
        if (!indexMatch || !indexMatch[1]) {
          console.error('Could not extract index name from error:', error.message);
          throw error;
        }
        const indexName = indexMatch[1];

        // Drop the problematic index
        try {
          await model.collection.dropIndex(indexName);
          console.log(`Dropped index ${indexName} from collection ${model.collection ? model.collection.collectionName : model.modelName}`);
        } catch (dropError) {
          console.error(`Failed to drop index ${indexName}:`, dropError);
          throw dropError;
        }

        // Increment retry count
        retries++;
        console.log(`Retrying operation (attempt ${retries + 1})...`);
        continue;
      }
      throw error; // Rethrow if not E11000 or max retries reached
    }
  }

  throw new Error('Max retries reached for E11000 error');
}

module.exports = handleDuplicateKeyError;