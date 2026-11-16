import * as stylex from "@stylexjs/stylex"

import { space } from "@ui/theme/tokens.stylex"

export const gapStyles = stylex.create({
  0: { columnGap: space.s0, rowGap: space.s0 },
  0.5: { columnGap: space.s0_5, rowGap: space.s0_5 },
  1: { columnGap: space.s1, rowGap: space.s1 },
  1.5: { columnGap: space.s1_5, rowGap: space.s1_5 },
  2: { columnGap: space.s2, rowGap: space.s2 },
  2.5: { columnGap: space.s2_5, rowGap: space.s2_5 },
  3: { columnGap: space.s3, rowGap: space.s3 },
  3.5: { columnGap: space.s3_5, rowGap: space.s3_5 },
  4: { columnGap: space.s4, rowGap: space.s4 },
  5: { columnGap: space.s5, rowGap: space.s5 },
  6: { columnGap: space.s6, rowGap: space.s6 },
  8: { columnGap: space.s8, rowGap: space.s8 },
  10: { columnGap: space.s10, rowGap: space.s10 },
  12: { columnGap: space.s12, rowGap: space.s12 },
  16: { columnGap: space.s16, rowGap: space.s16 },
  24: { columnGap: space.s24, rowGap: space.s24 },
})

export const paddingInlineStartStyles = stylex.create({
  0: { paddingInlineStart: space.s0 },
  0.5: { paddingInlineStart: space.s0_5 },
  1: { paddingInlineStart: space.s1 },
  1.5: { paddingInlineStart: space.s1_5 },
  2: { paddingInlineStart: space.s2 },
  2.5: { paddingInlineStart: space.s2_5 },
  3: { paddingInlineStart: space.s3 },
  3.5: { paddingInlineStart: space.s3_5 },
  4: { paddingInlineStart: space.s4 },
  5: { paddingInlineStart: space.s5 },
  6: { paddingInlineStart: space.s6 },
  8: { paddingInlineStart: space.s8 },
  10: { paddingInlineStart: space.s10 },
  12: { paddingInlineStart: space.s12 },
  16: { paddingInlineStart: space.s16 },
  24: { paddingInlineStart: space.s24 },
})

export const paddingInlineEndStyles = stylex.create({
  0: { paddingInlineEnd: space.s0 },
  0.5: { paddingInlineEnd: space.s0_5 },
  1: { paddingInlineEnd: space.s1 },
  1.5: { paddingInlineEnd: space.s1_5 },
  2: { paddingInlineEnd: space.s2 },
  2.5: { paddingInlineEnd: space.s2_5 },
  3: { paddingInlineEnd: space.s3 },
  3.5: { paddingInlineEnd: space.s3_5 },
  4: { paddingInlineEnd: space.s4 },
  5: { paddingInlineEnd: space.s5 },
  6: { paddingInlineEnd: space.s6 },
  8: { paddingInlineEnd: space.s8 },
  10: { paddingInlineEnd: space.s10 },
  12: { paddingInlineEnd: space.s12 },
  16: { paddingInlineEnd: space.s16 },
  24: { paddingInlineEnd: space.s24 },
})

export const paddingBlockStartStyles = stylex.create({
  0: { paddingBlockStart: space.s0 },
  0.5: { paddingBlockStart: space.s0_5 },
  1: { paddingBlockStart: space.s1 },
  1.5: { paddingBlockStart: space.s1_5 },
  2: { paddingBlockStart: space.s2 },
  2.5: { paddingBlockStart: space.s2_5 },
  3: { paddingBlockStart: space.s3 },
  3.5: { paddingBlockStart: space.s3_5 },
  4: { paddingBlockStart: space.s4 },
  5: { paddingBlockStart: space.s5 },
  6: { paddingBlockStart: space.s6 },
  8: { paddingBlockStart: space.s8 },
  10: { paddingBlockStart: space.s10 },
  12: { paddingBlockStart: space.s12 },
  16: { paddingBlockStart: space.s16 },
  24: { paddingBlockStart: space.s24 },
})

export const paddingBlockEndStyles = stylex.create({
  0: { paddingBlockEnd: space.s0 },
  0.5: { paddingBlockEnd: space.s0_5 },
  1: { paddingBlockEnd: space.s1 },
  1.5: { paddingBlockEnd: space.s1_5 },
  2: { paddingBlockEnd: space.s2 },
  2.5: { paddingBlockEnd: space.s2_5 },
  3: { paddingBlockEnd: space.s3 },
  3.5: { paddingBlockEnd: space.s3_5 },
  4: { paddingBlockEnd: space.s4 },
  5: { paddingBlockEnd: space.s5 },
  6: { paddingBlockEnd: space.s6 },
  8: { paddingBlockEnd: space.s8 },
  10: { paddingBlockEnd: space.s10 },
  12: { paddingBlockEnd: space.s12 },
  16: { paddingBlockEnd: space.s16 },
  24: { paddingBlockEnd: space.s24 },
})

type SpacingStep = keyof typeof gapStyles

export type { SpacingStep }
