export const justificationComparisonText =
  'The relationship between typographic colour and reading comfort has been studied extensively since the early twentieth century. ' +
  'When lines of justified text contain excessive inter-word spacing, the eye perceives pale horizontal streaks — "rivers" — that cut vertically through the paragraph, disrupting the smooth lateral scanning motion that skilled readers depend upon. ' +
  'These rivers are not merely an aesthetic blemish; they constitute a measurable impediment to reading speed and comprehension.\n\n' +

  'Traditional typesetting systems addressed this problem through a combination of techniques: hyphenation dictionaries that permitted words to break at syllable boundaries, ' +
  'letterspacing adjustments that distributed small amounts of additional space between individual characters, ' +
  'and — most significantly — global optimization algorithms that evaluated thousands of possible line-break combinations to find the arrangement minimizing total spacing deviation across the entire paragraph.\n\n' +

  'The Knuth-Plass algorithm, developed by Donald Knuth and Michael Plass for the TeX typesetting system in 1981, remains the gold standard for paragraph optimization. ' +
  'Rather than greedily filling each line from left to right, the algorithm constructs a graph of all feasible breakpoints and finds the shortest path — ' +
  'the combination of breaks that produces the most uniform spacing throughout. ' +
  'Even a simplified implementation produces dramatically better results than the greedy approach used by web browsers and most word processors.\n\n' +

  'Modern CSS justification operates on a strictly greedy, line-by-line basis: the browser fills each line with as many words as will fit, ' +
  'then distributes the remaining space uniformly between words. ' +
  'This approach requires no lookahead and executes quickly, but it produces wildly inconsistent spacing — ' +
  'particularly in narrow columns where a single long word can force enormous gaps across the preceding line. ' +
  'The result: rivers of white space that would have horrified any compositor working with metal type.'
