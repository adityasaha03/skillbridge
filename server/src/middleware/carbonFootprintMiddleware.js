const { co2 } = require('@tgwf/co2');

// Initialize CO2.js with the Sustainable Web Design (SWD) model
const co2Emission = new co2({ model: 'swd' });

/**
 * Express middleware to calculate network data transfer size and estimate carbon emissions.
 * Uses the Sustainable Web Design (SWD) model from The Green Web Foundation (@tgwf/co2).
 */
const carbonFootprintMiddleware = (req, res, next) => {
  let requestBytes = 0;
  let responseBytes = 0;

  // Calculate incoming request payload size
  if (req.body) {
    try {
      requestBytes += Buffer.byteLength(JSON.stringify(req.body), 'utf8');
    } catch {
      // Ignore serialization issues if any
    }
  }
  if (req.query) {
    try {
      requestBytes += Buffer.byteLength(JSON.stringify(req.query), 'utf8');
    } catch {
      // Ignore
    }
  }
  if (req.headers) {
    try {
      requestBytes += Buffer.byteLength(JSON.stringify(req.headers), 'utf8');
    } catch {
      // Ignore
    }
  }

  // Intercept response stream to measure outgoing byte payload
  const originalWrite = res.write;
  const originalEnd = res.end;

  res.write = function (chunk, ...args) {
    if (chunk) {
      responseBytes += Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(chunk, 'utf8');
    }
    return originalWrite.apply(res, [chunk, ...args]);
  };

  res.end = function (chunk, ...args) {
    if (chunk) {
      responseBytes += Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(chunk, 'utf8');
    }

    const totalBytes = requestBytes + responseBytes;
    res.locals.totalBytes = totalBytes;

    // Estimate CO2 emissions (greenHost = false indicates standard grid hosting)
    const greenHost = false;
    const emissions = co2Emission.perByte(totalBytes, greenHost);
    res.locals.emissions = emissions;

    // Attach auditing headers for frontend visibility & verification
    res.setHeader('X-Bytes-Transferred', totalBytes.toString());
    res.setHeader('X-Estimated-CO2-Grams', emissions.toFixed(6));

    if (process.env.NODE_ENV !== 'test') {
      console.log(`[Eco-Metrics] ${req.method} ${req.path} -> Data: ${totalBytes} bytes | CO₂: ${emissions.toFixed(6)}g`);
    }

    return originalEnd.apply(res, [chunk, ...args]);
  };

  next();
};

module.exports = carbonFootprintMiddleware;
