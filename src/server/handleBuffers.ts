const HEADER_OFFSET = 12; // DNS header is typically 12 bytes
// function to decode the buffers, into human legible format
export const handleBuffers = (buffer: Buffer): Buffer => {
  // for now just return the buffer decoded down from hexcode to string
  //   return buffer.toString('utf-8', HEADER_OFFSET, HEADER_OFFSET + buffer.length);
  return buffer;
};
