#!/usr/bin/env python3

import re
import sys
import random

# Get the possible values from validGuesses.ts
# Format in validGuesses.ts:
# "ㄅㄚㄉㄜㄕ":"八德市",
# "ㄅㄚㄉㄞㄩ":"八帶魚",
# "ㄅㄚㄉㄡㄗ":"八斗子",
# "ㄅㄚㄉㄧㄠ":"拔掉",
# "ㄅㄚㄉㄧㄥ":"把定/拔碇",
# "ㄅㄚㄉㄨㄛ":"把舵",

def read_valid_guesses():
    results = []
    with open('validGuesses.ts', 'r') as f:
        while line := f.readline():
            m = re.match(r'\"(.*)\":\"(.*)\"', line)
            if m:
                results.append((m.group(1), m.group(2)))
    return results

# Get the values from wordlist.ts
# Format in wordlist.ts:
# "ㄊㄠㄓㄨㄤ", // 套裝
# "ㄌㄨㄍㄨㄛ", // 路過
# "ㄗㄨㄛㄉㄠ", // 做到
# "ㄐㄧㄠㄧㄝ", // 郊野
# "ㄏㄨㄐㄧㄠ", // 呼叫
# "ㄧㄡㄓㄩㄢ", // 幼稚園

def read_existing_word_list():
    results = []
    with open('wordlist.ts', 'r') as f:
        while line := f.readline():
            m = re.match(r'\"(.*)\",? \/\/ (.*)', line)
            if m:
                results.append(m.group(2))
    return set(results)

def read_frequent_set():
    with open('freq.txt', 'r') as f:
        return set([line.strip() for line in f.readlines()])

def main():
    # Randomly generate guesses that are in the frequent set
    valid_guesses = read_valid_guesses()
    frequent_set = read_frequent_set()
    existing_word_list = read_existing_word_list()
    chosen = set()
    count = 0
    while True:
        guess = random.choice(valid_guesses)
        if guess[1] in frequent_set and guess[1] not in existing_word_list and guess[1] not in chosen:
            # Print the result in wordlist.ts format
            print(f'"{guess[0]}", // {guess[1]}')

            count += 1
            chosen.add(guess[1])
            if count > 500:
                break


if __name__ == '__main__':
    main()

