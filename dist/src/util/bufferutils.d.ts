import { Readable } from 'stream';
declare function bufferToReadableStream(buffer: Buffer): Readable;
declare function AsyncBufferToStream(buffer: Buffer): Promise<Readable>;
declare const _default: {
    bufferToReadableStream: typeof bufferToReadableStream;
    AsyncBufferToStream: typeof AsyncBufferToStream;
};
export default _default;
