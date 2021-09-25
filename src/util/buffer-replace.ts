function* replaceGenerator(
  buffer: Buffer,
  search: string,
  searchLength: number
) {
  let hasNext = true;
  let processingBuffer = buffer;

  while (hasNext) {
    const index = processingBuffer.indexOf(search);
    if (index === -1) {
      break;
    }

    const before = processingBuffer.slice(0, index);
    yield before;

    processingBuffer = processingBuffer.slice(index + searchLength);
    hasNext = Boolean(processingBuffer.length);
  }
  return processingBuffer;
}

const bufferReplace = (
  buffer: Buffer,
  search: string,
  replace: string
): Buffer => {
  const replaceBuffer = Buffer.from(replace);
  const generator = replaceGenerator(buffer, search, search.length);
  const bufferArray: Buffer[] = [];
  let result: IteratorResult<Buffer, Buffer>;

  do {
    result = generator.next();
    bufferArray.push(result.value);
    if (!result.done) {
      bufferArray.push(replaceBuffer);
    }
  } while (!result.done);

  return Buffer.concat(bufferArray);
};

export {bufferReplace};
