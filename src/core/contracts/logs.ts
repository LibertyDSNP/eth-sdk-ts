import { EventFilter } from "ethers/lib/ethers";
import { BatchPublicationLogData, decodeLogsForBatchPublication } from "./subscription";
import { ethers } from "ethers";
import { Log as EventLog } from "@ethersproject/abstract-provider";
import { DSNPError } from "../errors";
import { ConfigOpts, requireGetProvider } from "../config";

/**
 * BlockRangeOptions: represents parameters for specifying chain filter and block limits.
 */
export type BlockRangeOptions = {
  filter: EventFilter;
  walkbackBlocks: number;
  latestBlock: number;
  earliestBlock: number;
};

/**
 * The largest value allowed for walkback, based on the Infura event limit:
 *  ["Infura has a cap on requests of 10,000 events per query,"](https://blog.infura.io/ethereum-rpcs-methods/)
 *  This Infura limit actually caps event retrieval to 10k log events regardless of
 *  how many are in a block.
 */
export const MAX_ITERATOR_WALKBACK_BLOCKS = 10000;

/**
 *  AsyncPublicationsIterator is an AsyncIterableIterator which implements only an async next() function.
 *  Lazily fetches log events from the chain based on a Publications filter, walkbackBlocks
 *  and a range of blocks provided in the constructor.  When logs are found, they are
 *  decoded into Publications.
 */
export class AsyncPublicationsIterator {
  currentStartBlock: number;
  currentEndBlock: number;
  logIndex: number;
  publications: Array<BatchPublicationLogData>;
  provider: ethers.providers.Provider;
  blockRangeOptions: BlockRangeOptions;

  /**
   *
   * @param rangeOptions - BlockRangeOptions for fetching publications
   * @param provider - ethers.providers.Provider
   */
  constructor(rangeOptions: BlockRangeOptions, provider: ethers.providers.Provider) {
    this.blockRangeOptions = rangeOptions;
    this.currentEndBlock = rangeOptions.latestBlock;
    this.currentStartBlock = rangeOptions.latestBlock - rangeOptions.walkbackBlocks + 1;
    this.provider = provider;
    this.logIndex = 0;
    this.publications = [];
  }

  reachedEarliestBlock(): boolean {
    return this.currentEndBlock < this.blockRangeOptions.earliestBlock;
  }

  // we should fetch logs from the chain initially or if we've returned the last item
  // fetched last time.
  shouldFetchLogs(): boolean {
    return !this.publications.length || this.logIndex === this.publications.length - 1;
  }

  doneFetching(): boolean {
    return this.reachedEarliestBlock() && this.logIndex === this.publications.length;
  }

  async fetchUntilGetLogsOrDone(): Promise<void> {
    let logs: EventLog[] = [];
    // keep going until we get something or we hit the earliest requested block height.
    while (!logs.length && !this.reachedEarliestBlock()) {
      logs = await this.provider.getLogs({
        address: this.blockRangeOptions.filter.address,
        topics: this.blockRangeOptions.filter.topics,
        fromBlock: this.currentStartBlock,
        toBlock: this.currentEndBlock,
      });
      this.currentEndBlock = this.currentStartBlock - 1;
      this.currentStartBlock = Math.max(
        this.currentStartBlock - this.blockRangeOptions.walkbackBlocks,
        this.blockRangeOptions.earliestBlock
      );
    }
    this.logIndex = 0;
    this.publications = decodeLogsForBatchPublication(logs);
    return;
  }

  /**
   * next - returns a Promise of an IteratorResult enclosing a Publication.
   * IteratorResult = \{
   *    done: true if the earliest block has been reached AND the last Publication has
   *          been returned via next().
   *    value: a Publication
   * \}
   */
  public async next(): Promise<IteratorResult<BatchPublicationLogData>> {
    if (this.shouldFetchLogs()) {
      await this.fetchUntilGetLogsOrDone();
    } else {
      this.logIndex++;
    }
    return Promise.resolve({ done: this.doneFetching(), value: this.publications[this.logIndex] });
  }

  public async *[Symbol.asyncIterator](): AsyncIterableIterator<BatchPublicationLogData> {
    const res = await this.next();
    yield res.value;
  }
}

const requirePositive = (value: number, name: string) => {
  if (value < 0) {
    throw new DSNPError(`${name} must be > 0`);
  }
};

const requireValidBlockRange = (newestBlock?: number, oldestBlock?: number) => {
  if (newestBlock) requirePositive(newestBlock, "newestBlock");
  if (oldestBlock) requirePositive(oldestBlock, "oldestBlock");
  if (newestBlock && oldestBlock && oldestBlock >= newestBlock) {
    throw new DSNPError("newestBlock must be greater than oldestBlock");
  }
};

const requireValidWalkback = (walkbackBlocks: number) => {
  requirePositive(walkbackBlocks, "walkbackBlocks");
  if (walkbackBlocks > MAX_ITERATOR_WALKBACK_BLOCKS)
    throw new DSNPError("walkbackBlocks must be <= " + MAX_ITERATOR_WALKBACK_BLOCKS);
};

/**
 * getPublicationLogIterator fetches filtered logs based on the provided filter, in the range specified.
 *
 * @param filter - is an ethers EventFilter. It is required.
 * @param walkbackBlocks - is a number. It is required and must be :gt; 0 and &lt; MAX_WALKBACK
 * @param newestBlock - is a number. It is optional and must be :gt;0.  It defaults to the current block height.
 * @param oldestBlock - is a number. It is optional, must be :ge;0 , and defaults to 0.
 * @param opts - ConfigOpts
 */
export const getPublicationLogIterator = async (
  filter: EventFilter,
  walkbackBlocks: number,
  newestBlock?: number,
  oldestBlock?: number,
  opts?: ConfigOpts
): Promise<AsyncPublicationsIterator> => {
  requireValidWalkback(walkbackBlocks);
  requireValidBlockRange(newestBlock, oldestBlock);
  const provider = requireGetProvider(opts);
  const newest = newestBlock || (await provider.getBlockNumber());
  const oldest = oldestBlock === undefined ? 0 : oldestBlock;
  return new AsyncPublicationsIterator(
    {
      earliestBlock: oldest,
      latestBlock: newest,
      walkbackBlocks: Math.min(newest - oldest + 1, walkbackBlocks),
      filter: filter,
    },
    provider
  );
};
