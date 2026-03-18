import { extractJSON, LLMParseError } from '@/lib/llm'

test('extractJSON parses plain JSON', () => {
  const result = extractJSON('{"key": "value"}')
  expect(result).toEqual({ key: 'value' })
})

test('extractJSON strips markdown code fences', () => {
  const result = extractJSON('```json\n{"key": "value"}\n```')
  expect(result).toEqual({ key: 'value' })
})

test('extractJSON extracts JSON from surrounding text', () => {
  const result = extractJSON('Here is the result: {"key": "value"} done.')
  expect(result).toEqual({ key: 'value' })
})

test('extractJSON throws LLMParseError on invalid JSON', () => {
  expect(() => extractJSON('not json at all')).toThrow(LLMParseError)
})

test('extractJSON throws LLMParseError on empty string', () => {
  expect(() => extractJSON('')).toThrow(LLMParseError)
})
