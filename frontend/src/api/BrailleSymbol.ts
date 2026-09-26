import { listAll, putRow, STORES } from "../utils/indexedDb";
import type { BrailleSymbol } from "../types/BrailleSymbol";

export async function listBrailleSymbol(): Promise<BrailleSymbol[]> {
  return listAll<BrailleSymbol>(STORES.brailleSymbol);
}

export async function saveBrailleSymbol(payload: BrailleSymbol): Promise<BrailleSymbol> {
  return putRow(STORES.brailleSymbol, payload);
}
