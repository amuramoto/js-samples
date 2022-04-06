import { test, expect } from "@playwright/test";
import {
  waitForPlaygroundPreviewToLoad,
  failOnPageError,
  NONDETERMINISTIC_SAMPLES,
} from "../utils";
import fs from "fs";

export const BROKEN_PLAYGROUND_SAMPLES = [
  // "deckgl-arclayer", // https://github.com/google/playground-elements/issues/286
  // "deckgl-points", // https://github.com/google/playground-elements/issues/286
  // "deckgl-tripslayer", // https://github.com/google/playground-elements/issues/286
  "react-map", // requires jsx support
  "store-locator", // Distance Matrix Service: You have exceeded your rate-limit for this API.
];

const samples = fs
  .readdirSync("samples", { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  // TODO: remove this once the samples are fixed
  .filter((name) => !BROKEN_PLAYGROUND_SAMPLES.includes(name));

test.describe.parallel("suite", () => {
  samples.forEach((sample) => {
    test(`playground screenshots match - ${sample}`, async ({ page }) => {
      test.setTimeout(30000);
      failOnPageError(page);

      await page.goto(`/samples/playground.html?sample=${sample}`);
      await waitForPlaygroundPreviewToLoad(page);
      await page.waitForTimeout(1000);
      await page.waitForLoadState("networkidle");

      if (!NONDETERMINISTIC_SAMPLES.includes(sample)) {
        expect(
          await page.locator("playground-preview").screenshot()
        ).toMatchImageDiff({ name: `${sample}-preview.png` });
        expect(await page.locator("#code").screenshot()).toMatchImageDiff({
          name: `${sample}-code.png`,
        });
      }
    });
  });
});