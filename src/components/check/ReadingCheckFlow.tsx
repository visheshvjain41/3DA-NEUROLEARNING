import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Delete,
  Play,
  RotateCcw,
  Sparkles,
  Star,
  Volume2,
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import type {
  ReadingGameId,
  ReadingGameMetrics,
  ReadingLanguage,
  TrafficBand,
} from '../../types/neuro';
import { playCelebrationChord, playGentleSuccess, playSoftTap } from '../../utils/gentleAudio';

interface ReadingCheckFlowProps {
  standalone?: boolean;
  onBack: () => void;
  onJumpToReadingWorld: () => void;
}

const LANGUAGE_OPTIONS: Array<{ id: ReadingLanguage; label: string; native: string; bcp47: string }> =
  [
    { id: 'en', label: 'English', native: 'English', bcp47: 'en-IN' },
    { id: 'hi', label: 'Hindi', native: 'हिन्दी', bcp47: 'hi-IN' },
    { id: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ', bcp47: 'kn-IN' },
  ];

interface SoundQuestion {
  prompt: string;
  speechPrompt: string;
  options: string[];
  answer: string;
  kind: 'rhyme' | 'odd-start';
}

interface LetterSoundQuestion {
  speechPrompt: string;
  soundCue: string;
  options: string[];
  answer: string;
  pairLabel?: string;
}

interface NonwordItem {
  word: string;
  patternNote: string;
}

interface SpellingItem {
  word: string;
  speechPrompt: string;
  hintCue: string;
}

interface MemoryTrial {
  sequence: string[];
  speechText: string;
  keypad: string[];
}

interface LanguageBank {
  sound: SoundQuestion[];
  letterSound: LetterSoundQuestion[];
  nonword: NonwordItem[];
  spelling: SpellingItem[];
  memory: MemoryTrial[];
  hearPromptText: string;
}

const READING_BANKS: Record<ReadingLanguage, LanguageBank> = {
  en: {
    hearPromptText: 'Please read this made-up word out loud.',
    sound: [
      {
        prompt: 'Which word rhymes with "cat"?',
        speechPrompt: 'Which word rhymes with cat? Hat, dog, or cup?',
        options: ['hat', 'dog', 'cup'],
        answer: 'hat',
        kind: 'rhyme',
      },
      {
        prompt: 'Which word starts with a DIFFERENT sound?',
        speechPrompt: 'Which word starts with a different sound? Sun, sock, or ball?',
        options: ['sun', 'sock', 'ball'],
        answer: 'ball',
        kind: 'odd-start',
      },
      {
        prompt: 'Which word rhymes with "star"?',
        speechPrompt: 'Which word rhymes with star? Tree, car, or book?',
        options: ['tree', 'car', 'book'],
        answer: 'car',
        kind: 'rhyme',
      },
      {
        prompt: 'Which word starts with a DIFFERENT sound?',
        speechPrompt: 'Which word starts with a different sound? Moon, milk, or frog?',
        options: ['moon', 'milk', 'frog'],
        answer: 'frog',
        kind: 'odd-start',
      },
      {
        prompt: 'Which word rhymes with "boat"?',
        speechPrompt: 'Which word rhymes with boat? Coat, fish, or leaf?',
        options: ['coat', 'fish', 'leaf'],
        answer: 'coat',
        kind: 'rhyme',
      },
      {
        prompt: 'Which word starts with a DIFFERENT sound?',
        speechPrompt: 'Which word starts with a different sound? Pen, pear, or kite?',
        options: ['pen', 'pear', 'kite'],
        answer: 'kite',
        kind: 'odd-start',
      },
      {
        prompt: 'Which word rhymes with "ring"?',
        speechPrompt: 'Which word rhymes with ring? Bell, sing, or drum?',
        options: ['bell', 'sing', 'drum'],
        answer: 'sing',
        kind: 'rhyme',
      },
      {
        prompt: 'Which word starts with a DIFFERENT sound?',
        speechPrompt: 'Which word starts with a different sound? Train, tree, or lamp?',
        options: ['train', 'tree', 'lamp'],
        answer: 'lamp',
        kind: 'odd-start',
      },
    ],
    letterSound: [
      {
        speechPrompt: 'Tap the letter that makes the b sound, like in ball.',
        soundCue: 'b as in ball',
        options: ['b', 'd', 'p', 'm'],
        answer: 'b',
        pairLabel: 'b/d',
      },
      {
        speechPrompt: 'Tap the letter that makes the d sound, like in dog.',
        soundCue: 'd as in dog',
        options: ['b', 'd', 'q', 't'],
        answer: 'd',
        pairLabel: 'b/d',
      },
      {
        speechPrompt: 'Tap the letter that makes the p sound, like in pen.',
        soundCue: 'p as in pen',
        options: ['q', 'b', 'p', 'g'],
        answer: 'p',
        pairLabel: 'p/q',
      },
      {
        speechPrompt: 'Tap the letter that makes the s sound, like in sun.',
        soundCue: 's as in sun',
        options: ['z', 's', 'c', 'r'],
        answer: 's',
      },
      {
        speechPrompt: 'Tap the letter that makes the m sound, like in moon.',
        soundCue: 'm as in moon',
        options: ['n', 'w', 'm', 'u'],
        answer: 'm',
        pairLabel: 'm/n',
      },
      {
        speechPrompt: 'Tap the letter that makes the n sound, like in nest.',
        soundCue: 'n as in nest',
        options: ['m', 'u', 'n', 'h'],
        answer: 'n',
        pairLabel: 'm/n',
      },
      {
        speechPrompt: 'Tap the letter that makes the f sound, like in fish.',
        soundCue: 'f as in fish',
        options: ['f', 't', 'v', 'l'],
        answer: 'f',
      },
      {
        speechPrompt: 'Tap the letter that makes the q sound, like in queen.',
        soundCue: 'q as in queen',
        options: ['p', 'g', 'q', 'd'],
        answer: 'q',
        pairLabel: 'p/q',
      },
      {
        speechPrompt: 'Tap the letter that makes the k sound, like in kite.',
        soundCue: 'k as in kite',
        options: ['k', 'h', 'x', 'r'],
        answer: 'k',
      },
      {
        speechPrompt: 'Tap the letter that makes the v sound, like in van.',
        soundCue: 'v as in van',
        options: ['u', 'w', 'v', 'y'],
        answer: 'v',
      },
    ],
    nonword: [
      { word: 'dap', patternNote: 'b/d/p onset decoding' },
      { word: 'blint', patternNote: 'consonant blend decoding' },
      { word: 'frem', patternNote: 'consonant blend decoding' },
      { word: 'skod', patternNote: 'short vowel CVC decoding' },
      { word: 'trusp', patternNote: 'blend and ending cluster' },
      { word: 'pob', patternNote: 'b/p sound contrast' },
      { word: 'grint', patternNote: 'consonant cluster decoding' },
      { word: 'snab', patternNote: 'final b/d distinction' },
    ],
    spelling: [
      {
        word: 'bed',
        speechPrompt: 'Spell the word: bed. I sleep in a warm bed.',
        hintCue: '3 letters · starts with b, ends with d',
      },
      {
        word: 'dog',
        speechPrompt: 'Spell the word: dog. The friendly dog wagged its tail.',
        hintCue: '3 letters · starts with d',
      },
      {
        word: 'bat',
        speechPrompt: 'Spell the word: bat. Hit the ball with the bat.',
        hintCue: '3 letters · starts with b',
      },
      {
        word: 'frog',
        speechPrompt: 'Spell the word: frog. A green frog hopped by the pond.',
        hintCue: '4 letters · starts with fr',
      },
      {
        word: 'ship',
        speechPrompt: 'Spell the word: ship. The big ship sailed across the sea.',
        hintCue: '4 letters · starts with sh',
      },
      {
        word: 'drum',
        speechPrompt: 'Spell the word: drum. Tap a steady beat on the drum.',
        hintCue: '4 letters · starts with dr',
      },
      {
        word: 'clap',
        speechPrompt: 'Spell the word: clap. Let us clap our hands together.',
        hintCue: '4 letters · starts with cl',
      },
      {
        word: 'nest',
        speechPrompt: 'Spell the word: nest. Two little birds sit in the nest.',
        hintCue: '4 letters · ends with st',
      },
    ],
    memory: [
      {
        sequence: ['4', '9'],
        speechText: '4, 9',
        keypad: ['2', '4', '7', '9', 'B', 'D'],
      },
      {
        sequence: ['B', '7', '3'],
        speechText: 'B, 7, 3',
        keypad: ['3', '5', '7', 'B', 'D', 'K'],
      },
      {
        sequence: ['5', 'M', '2', '8'],
        speechText: '5, M, 2, 8',
        keypad: ['2', '5', '8', 'M', 'N', 'R'],
      },
      {
        sequence: ['K', '4', '9', 'D', '6'],
        speechText: 'K, 4, 9, D, 6',
        keypad: ['4', '6', '9', 'B', 'D', 'K', 'S'],
      },
      {
        sequence: ['3', 'P', '8', '2', 'F', '7'],
        speechText: '3, P, 8, 2, F, 7',
        keypad: ['2', '3', '7', '8', 'F', 'P', 'Q', 'T'],
      },
    ],
  },
  hi: {
    hearPromptText: 'कृपया इस बनाए गए शब्द को ज़ोर से पढ़ें।',
    sound: [
      {
        prompt: '"जल" से तुक (rhyme) मिलने वाला शब्द चुनें:',
        speechPrompt: 'जल से तुक मिलने वाला शब्द कौन सा है? फल, घर, या आम?',
        options: ['फल', 'घर', 'आम'],
        answer: 'फल',
        kind: 'rhyme',
      },
      {
        prompt: 'कौन सा शब्द अलग आवाज़ से शुरू होता है?',
        speechPrompt: 'कौन सा शब्द अलग आवाज़ से शुरू होता है? कमल, कलम, या पतंग?',
        options: ['कमल', 'कलम', 'पतंग'],
        answer: 'पतंग',
        kind: 'odd-start',
      },
      {
        prompt: '"तारा" से तुक मिलने वाला शब्द चुनें:',
        speechPrompt: 'तारा से तुक मिलने वाला शब्द कौन सा है? सारा, नदी, या फूल?',
        options: ['सारा', 'नदी', 'फूल'],
        answer: 'सारा',
        kind: 'rhyme',
      },
      {
        prompt: 'कौन सा शब्द अलग आवाज़ से शुरू होता है?',
        speechPrompt: 'कौन सा शब्द अलग आवाज़ से शुरू होता है? मछली, मटर, या हाथी?',
        options: ['मछली', 'मटर', 'हाथी'],
        answer: 'हाथी',
        kind: 'odd-start',
      },
      {
        prompt: '"मन" से तुक मिलने वाला शब्द चुनें:',
        speechPrompt: 'मन से तुक मिलने वाला शब्द कौन सा है? तन, पेड़, या चाँद?',
        options: ['तन', 'पेड़', 'चाँद'],
        answer: 'तन',
        kind: 'rhyme',
      },
      {
        prompt: 'कौन सा शब्द अलग आवाज़ से शुरू होता है?',
        speechPrompt: 'कौन सा शब्द अलग आवाज़ से शुरू होता है? बकरी, बस, या सूरज?',
        options: ['बकरी', 'बस', 'सूरज'],
        answer: 'सूरज',
        kind: 'odd-start',
      },
      {
        prompt: '"रात" से तुक मिलने वाला शब्द चुनें:',
        speechPrompt: 'रात से तुक मिलने वाला शब्द कौन सा है? बात, मेज़, या तितली?',
        options: ['बात', 'मेज़', 'तितली'],
        answer: 'बात',
        kind: 'rhyme',
      },
      {
        prompt: 'कौन सा शब्द अलग आवाज़ से शुरू होता है?',
        speechPrompt: 'कौन सा शब्द अलग आवाज़ से शुरू होता है? नाव, नल, या किताब?',
        options: ['नाव', 'नल', 'किताब'],
        answer: 'किताब',
        kind: 'odd-start',
      },
    ],
    letterSound: [
      {
        speechPrompt: 'क अक्षर चुनें, जैसे कमल।',
        soundCue: 'क (कमल)',
        options: ['क', 'ख', 'फ', 'ग'],
        answer: 'क',
        pairLabel: 'क/फ',
      },
      {
        speechPrompt: 'ब अक्षर चुनें, जैसे बकरी।',
        soundCue: 'ब (बकरी)',
        options: ['ब', 'व', 'प', 'म'],
        answer: 'ब',
        pairLabel: 'ब/व',
      },
      {
        speechPrompt: 'घ अक्षर चुनें, जैसे घर।',
        soundCue: 'घ (घर)',
        options: ['घ', 'ध', 'छ', 'ग'],
        answer: 'घ',
        pairLabel: 'घ/ध',
      },
      {
        speechPrompt: 'म अक्षर चुनें, जैसे मछली।',
        soundCue: 'म (मछली)',
        options: ['भ', 'म', 'न', 'य'],
        answer: 'म',
        pairLabel: 'म/भ',
      },
      {
        speechPrompt: 'प अक्षर चुनें, जैसे पतंग।',
        soundCue: 'प (पतंग)',
        options: ['प', 'ष', 'य', 'फ'],
        answer: 'प',
      },
      {
        speechPrompt: 'स अक्षर चुनें, जैसे सूरज।',
        soundCue: 'स (सूरज)',
        options: ['स', 'श', 'र', 'ख'],
        answer: 'स',
      },
      {
        speechPrompt: 'त अक्षर चुनें, जैसे तारा।',
        soundCue: 'त (तारा)',
        options: ['त', 'ल', 'न', 'द'],
        answer: 'त',
      },
      {
        speechPrompt: 'व अक्षर चुनें, जैसे वन।',
        soundCue: 'व (वन)',
        options: ['ब', 'व', 'च', 'क'],
        answer: 'व',
        pairLabel: 'ब/व',
      },
      {
        speechPrompt: 'र अक्षर चुनें, जैसे रथ।',
        soundCue: 'र (रथ)',
        options: ['र', 'स', 'ख', 'द'],
        answer: 'र',
      },
      {
        speechPrompt: 'न अक्षर चुनें, जैसे नल।',
        soundCue: 'न (नल)',
        options: ['न', 'म', 'त', 'ग'],
        answer: 'न',
      },
    ],
    nonword: [
      { word: 'लपम', patternNote: 'सरल तीन-अक्षर संयोजन' },
      { word: 'गटफ', patternNote: 'व्यंजन पहचान' },
      { word: 'सनक', patternNote: 'समान ध्वनि भेद' },
      { word: 'बवद', patternNote: 'ब/व अक्षर भेद' },
      { word: 'चपलक', patternNote: 'लम्बा बिना मात्रा शब्द' },
      { word: 'मरत', patternNote: 'त्वरित ध्वनि पठन' },
      { word: 'धघर', patternNote: 'घ/ध अक्षर भेद' },
      { word: 'किपन', patternNote: 'मात्रा के साथ पठन' },
    ],
    spelling: [
      { word: 'घर', speechPrompt: 'लिखें: घर। यह मेरा घर है।', hintCue: '2 अक्षर · घ + र' },
      { word: 'जल', speechPrompt: 'लिखें: जल। ठंडा जल पियो।', hintCue: '2 अक्षर · ज + ल' },
      { word: 'बस', speechPrompt: 'लिखें: बस। स्कूल बस आ गई।', hintCue: '2 अक्षर · ब + स' },
      { word: 'कमल', speechPrompt: 'लिखें: कमल। तालाब में कमल खिला है।', hintCue: '3 अक्षर · क + म + ल' },
      { word: 'फल', speechPrompt: 'लिखें: फल। ताज़े फल खाओ।', hintCue: '2 अक्षर · फ + ल' },
      { word: 'नल', speechPrompt: 'लिखें: नल। नल बंद कर दो।', hintCue: '2 अक्षर · न + ल' },
      { word: 'मटर', speechPrompt: 'लिखें: मटर। हरी मटर मीठी है।', hintCue: '3 अक्षर · म + ट + र' },
      { word: 'तारा', speechPrompt: 'लिखें: तारा। आसमान में तारा चमका।', hintCue: '2 अक्षर · ता + रा' },
    ],
    memory: [
      {
        sequence: ['2', '8'],
        speechText: '2, 8',
        keypad: ['2', '5', '8', 'क', 'म', 'र'],
      },
      {
        sequence: ['क', '4', '9'],
        speechText: 'क, 4, 9',
        keypad: ['4', '7', '9', 'क', 'ब', 'स'],
      },
      {
        sequence: ['3', 'म', '6', '1'],
        speechText: '3, म, 6, 1',
        keypad: ['1', '3', '6', 'म', 'न', 'त'],
      },
      {
        sequence: ['ब', '5', '8', 'र', '2'],
        speechText: 'ब, 5, 8, र, 2',
        keypad: ['2', '5', '8', 'ब', 'व', 'र', 'ल'],
      },
      {
        sequence: ['7', 'स', '4', '9', 'प', '3'],
        speechText: '7, स, 4, 9, प, 3',
        keypad: ['3', '4', '7', '9', 'स', 'प', 'क', 'त'],
      },
    ],
  },
  kn: {
    hearPromptText: 'ದಯವಿಟ್ಟು ಈ ಹೊಸ ಪದವನ್ನು ಗಟ್ಟಿಯಾಗಿ ಓದಿ.',
    sound: [
      {
        prompt: '"ಮರ" ಪದಕ್ಕೆ ಪ್ರಾಸ (rhyme) ಹೊಂದುವ ಪದ ಆರಿಸಿ:',
        speechPrompt: 'ಮರ ಪದಕ್ಕೆ ಪ್ರಾಸ ಹೊಂದುವ ಪದ ಯಾವುದು? ಕರ, ಹೂವು, ಅಥವಾ ನೀರು?',
        options: ['ಕರ', 'ಹೂವು', 'ನೀರು'],
        answer: 'ಕರ',
        kind: 'rhyme',
      },
      {
        prompt: 'ಬೇರೆ ಶಬ್ದದಿಂದ ಶುರುವಾಗುವ ಪದ ಯಾವುದು?',
        speechPrompt: 'ಬೇರೆ ಶಬ್ದದಿಂದ ಶುರುವಾಗುವ ಪದ ಯಾವುದು? ಕಮಲ, ಕಾಗದ, ಅಥವಾ ಮನೆ?',
        options: ['ಕಮಲ', 'ಕಾಗದ', 'ಮನೆ'],
        answer: 'ಮನೆ',
        kind: 'odd-start',
      },
      {
        prompt: '"ತಾರೆ" ಪದಕ್ಕೆ ಪ್ರಾಸ ಹೊಂದುವ ಪದ ಆರಿಸಿ:',
        speechPrompt: 'ತಾರೆ ಪದಕ್ಕೆ ಪ್ರಾಸ ಹೊಂದುವ ಪದ ಯಾವುದು? ದಾರೆ, ಹಕ್ಕಿ, ಅಥವಾ ಮಳೆ?',
        options: ['ದಾರೆ', 'ಹಕ್ಕಿ', 'ಮಳೆ'],
        answer: 'ದಾರೆ',
        kind: 'rhyme',
      },
      {
        prompt: 'ಬೇರೆ ಶಬ್ದದಿಂದ ಶುರುವಾಗುವ ಪದ ಯಾವುದು?',
        speechPrompt: 'ಬೇರೆ ಶಬ್ದದಿಂದ ಶುರುವಾಗುವ ಪದ ಯಾವುದು? ಹಸಿರು, ಹಣ್ಣು, ಅಥವಾ ಚಂದ್ರ?',
        options: ['ಹಸಿರು', 'ಹಣ್ಣು', 'ಚಂದ್ರ'],
        answer: 'ಚಂದ್ರ',
        kind: 'odd-start',
      },
      {
        prompt: '"ಬಲೆ" ಪದಕ್ಕೆ ಪ್ರಾಸ ಹೊಂದುವ ಪದ ಆರಿಸಿ:',
        speechPrompt: 'ಬಲೆ ಪದಕ್ಕೆ ಪ್ರಾಸ ಹೊಂದುವ ಪದ ಯಾವುದು? ಮಲೆ, ಸೂರ್ಯ, ಅಥವಾ ಗಾಳಿ?',
        options: ['ಮಲೆ', 'ಸೂರ್ಯ', 'ಗಾಳಿ'],
        answer: 'ಮಲೆ',
        kind: 'rhyme',
      },
      {
        prompt: 'ಬೇರೆ ಶಬ್ದದಿಂದ ಶುರುವಾಗುವ ಪದ ಯಾವುದು?',
        speechPrompt: 'ಬೇರೆ ಶಬ್ದದಿಂದ ಶುರುವಾಗುವ ಪದ ಯಾವುದು? ನದಿ, ನಕ್ಷತ್ರ, ಅಥವಾ ಪುಸ್ತಕ?',
        options: ['ನದಿ', 'ನಕ್ಷತ್ರ', 'ಪುಸ್ತಕ'],
        answer: 'ಪುಸ್ತಕ',
        kind: 'odd-start',
      },
      {
        prompt: '"ಕಾಲು" ಪದಕ್ಕೆ ಪ್ರಾಸ ಹೊಂದುವ ಪದ ಆರಿಸಿ:',
        speechPrompt: 'ಕಾಲು ಪದಕ್ಕೆ ಪ್ರಾಸ ಹೊಂದುವ ಪದ ಯಾವುದು? ಹಾಲು, ಮೋಡ, ಅಥವಾ ಬೆಟ್ಟ?',
        options: ['ಹಾಲು', 'ಮೋಡ', 'ಬೆಟ್ಟ'],
        answer: 'ಹಾಲು',
        kind: 'rhyme',
      },
      {
        prompt: 'ಬೇರೆ ಶಬ್ದದಿಂದ ಶುರುವಾಗುವ ಪದ ಯಾವುದು?',
        speechPrompt: 'ಬೇರೆ ಶಬ್ದದಿಂದ ಶುರುವಾಗುವ ಪದ ಯಾವುದು? ಬಣ್ಣ, ಬಾಗಿಲು, ಅಥವಾ ತೋಟ?',
        options: ['ಬಣ್ಣ', 'ಬಾಗಿಲು', 'ತೋಟ'],
        answer: 'ತೋಟ',
        kind: 'odd-start',
      },
    ],
    letterSound: [
      {
        speechPrompt: 'ಕ ಅಕ್ಷರವನ್ನು ಒತ್ತಿ, ಉದಾಹರಣೆಗೆ ಕಮಲ.',
        soundCue: 'ಕ (ಕಮಲ)',
        options: ['ಕ', 'ತ', 'ನ', 'ಗ'],
        answer: 'ಕ',
      },
      {
        speechPrompt: 'ಬ ಅಕ್ಷರವನ್ನು ಒತ್ತಿ, ಉದಾಹರಣೆಗೆ ಬಣ್ಣ.',
        soundCue: 'ಬ (ಬಣ್ಣ)',
        options: ['ಬ', 'ಒ', 'ಪ', 'ಮ'],
        answer: 'ಬ',
        pairLabel: 'ಬ/ಒ',
      },
      {
        speechPrompt: 'ಮ ಅಕ್ಷರವನ್ನು ಒತ್ತಿ, ಉದಾಹರಣೆಗೆ ಮನೆ.',
        soundCue: 'ಮ (ಮನೆ)',
        options: ['ಮ', 'ಯ', 'ನ', 'ವ'],
        answer: 'ಮ',
        pairLabel: 'ಮ/ಯ',
      },
      {
        speechPrompt: 'ಪ ಅಕ್ಷರವನ್ನು ಒತ್ತಿ, ಉದಾಹರಣೆಗೆ ಪುಸ್ತಕ.',
        soundCue: 'ಪ (ಪುಸ್ತಕ)',
        options: ['ಪ', 'ವ', 'ಹ', 'ಫ'],
        answer: 'ಪ',
        pairLabel: 'ಪ/ವ',
      },
      {
        speechPrompt: 'ಸ ಅಕ್ಷರವನ್ನು ಒತ್ತಿ, ಉದಾಹರಣೆಗೆ ಸೂರ್ಯ.',
        soundCue: 'ಸ (ಸೂರ್ಯ)',
        options: ['ಸ', 'ನ', 'ದ', 'ರ'],
        answer: 'ಸ',
      },
      {
        speechPrompt: 'ನ ಅಕ್ಷರವನ್ನು ಒತ್ತಿ, ಉದಾಹರಣೆಗೆ ನದಿ.',
        soundCue: 'ನ (ನದಿ)',
        options: ['ನ', 'ಸ', 'ಮ', 'ಗ'],
        answer: 'ನ',
      },
      {
        speechPrompt: 'ತ ಅಕ್ಷರವನ್ನು ಒತ್ತಿ, ಉದಾಹರಣೆಗೆ ತಾರೆ.',
        soundCue: 'ತ (ತಾರೆ)',
        options: ['ತ', 'ಕ', 'ದ', 'ಲ'],
        answer: 'ತ',
      },
      {
        speechPrompt: 'ಹ ಅಕ್ಷರವನ್ನು ಒತ್ತಿ, ಉದಾಹರಣೆಗೆ ಹಕ್ಕಿ.',
        soundCue: 'ಹ (ಹಕ್ಕಿ)',
        options: ['ಹ', 'ವ', 'ಪ', 'ಜ'],
        answer: 'ಹ',
      },
      {
        speechPrompt: 'ರ ಅಕ್ಷರವನ್ನು ಒತ್ತಿ, ಉದಾಹರಣೆಗೆ ರಥ.',
        soundCue: 'ರ (ರಥ)',
        options: ['ರ', 'ಠ', 'ದ', 'ಲ'],
        answer: 'ರ',
        pairLabel: 'ರ/ಠ',
      },
      {
        speechPrompt: 'ದ ಅಕ್ಷರವನ್ನು ಒತ್ತಿ, ಉದಾಹರಣೆಗೆ ದೀಪ.',
        soundCue: 'ದ (ದೀಪ)',
        options: ['ದ', 'ಧ', 'ಬ', 'ನ'],
        answer: 'ದ',
        pairLabel: 'ದ/ಧ',
      },
    ],
    nonword: [
      { word: 'ಲಪಗ', patternNote: 'ಸರಳ ಮೂರು ಅಕ್ಷರ ಪದ' },
      { word: 'ಬವನ', patternNote: 'ಅಕ್ಷರ ವ್ಯತ್ಯಾಸ ಪತ್ತೆ' },
      { word: 'ಮಯಕ', patternNote: 'ಮ/ಯ ಅಕ್ಷರ ವ್ಯತ್ಯಾಸ' },
      { word: 'ತಡಪ', patternNote: 'ಧ್ವನಿ ಜೋಡಣೆ' },
      { word: 'ಕಸರಲ', patternNote: 'ಉದ್ದ ಸರಳ ಪದ' },
      { word: 'ನಪತ', patternNote: 'ಪ/ನ ಅಕ್ಷರ ಓದು' },
      { word: 'ದರಮ', patternNote: 'ಸರಾಗ ಓದು' },
      { word: 'ಪವಟ', patternNote: 'ಪ/ವ ಅಕ್ಷರ ವ್ಯತ್ಯಾಸ' },
    ],
    spelling: [
      { word: 'ಮರ', speechPrompt: 'ಬರೆಯಿರಿ: ಮರ. ಹಸಿರು ಮರ.', hintCue: '2 ಅಕ್ಷರ · ಮ + ರ' },
      { word: 'ಮನೆ', speechPrompt: 'ಬರೆಯಿರಿ: ಮನೆ. ನಮ್ಮ ಮನೆ.', hintCue: '2 ಅಕ್ಷರ · ಮ + ನೆ' },
      { word: 'ನದಿ', speechPrompt: 'ಬರೆಯಿರಿ: ನದಿ. ಶುದ್ಧ ನದಿ.', hintCue: '2 ಅಕ್ಷರ · ನ + ದಿ' },
      { word: 'ಕಮಲ', speechPrompt: 'ಬರೆಯಿರಿ: ಕಮಲ. ಕಮಲ ಹೂವು.', hintCue: '3 ಅಕ್ಷರ · ಕ + ಮ + ಲ' },
      { word: 'ಹಣ್ಣು', speechPrompt: 'ಬರೆಯಿರಿ: ಹಣ್ಣು. ಸಿಹಿ ಹಣ್ಣು.', hintCue: 'ಹ + ಣ್ಣು' },
      { word: 'ಬಲೆ', speechPrompt: 'ಬರೆಯಿರಿ: ಬಲೆ. ಮೀನಿನ ಬಲೆ.', hintCue: '2 ಅಕ್ಷರ · ಬ + ಲೆ' },
      { word: 'ತಾರೆ', speechPrompt: 'ಬರೆಯಿರಿ: ತಾರೆ. ಆಕಾಶದಲ್ಲಿ ತಾರೆ.', hintCue: '2 ಅಕ್ಷರ · ತಾ + ರೆ' },
      { word: 'ಕರ', speechPrompt: 'ಬರೆಯಿರಿ: ಕರ. ಕೈ ಕರ.', hintCue: '2 ಅಕ್ಷರ · ಕ + ರ' },
    ],
    memory: [
      {
        sequence: ['3', '7'],
        speechText: '3, 7',
        keypad: ['3', '5', '7', 'ಕ', 'ಮ', 'ರ'],
      },
      {
        sequence: ['ಕ', '2', '8'],
        speechText: 'ಕ, 2, 8',
        keypad: ['2', '6', '8', 'ಕ', 'ಬ', 'ನ'],
      },
      {
        sequence: ['4', 'ಮ', '9', '1'],
        speechText: '4, ಮ, 9, 1',
        keypad: ['1', '4', '9', 'ಮ', 'ಯ', 'ತ'],
      },
      {
        sequence: ['ಪ', '6', '3', 'ರ', '5'],
        speechText: 'ಪ, 6, 3, ರ, 5',
        keypad: ['3', '5', '6', 'ಪ', 'ವ', 'ರ', 'ಲ'],
      },
      {
        sequence: ['8', 'ಸ', '2', '7', 'ನ', '4'],
        speechText: '8, ಸ, 2, 7, ನ, 4',
        keypad: ['2', '4', '7', '8', 'ಸ', 'ನ', 'ಕ', 'ದ'],
      },
    ],
  },
};

function speakText(text: string, lang: ReadingLanguage) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const bcp = LANGUAGE_OPTIONS.find((l) => l.id === lang)?.bcp47 ?? 'en-IN';
    utterance.lang = bcp;
    utterance.rate = 0.88;
    const voices = synth.getVoices();
    const prefix = lang === 'en' ? 'en' : lang;
    const matchingVoice =
      voices.find((v) => v.lang.toLowerCase() === bcp.toLowerCase()) ||
      voices.find((v) => v.lang.toLowerCase().startsWith(prefix));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }
    synth.speak(utterance);
  } catch {
    // Graceful no-op if speech synthesis is blocked
  }
}

function medianMs(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    : Math.round(sorted[mid]);
}

// Placeholder cut-offs (indicative only): >=80 Green, 60-79 Amber, <60 Red
function readingBand(pct: number): TrafficBand {
  if (pct >= 80) return 'Green';
  if (pct >= 60) return 'Amber';
  return 'Red';
}

function bandClasses(band: TrafficBand) {
  if (band === 'Green') return 'border-emerald-300 bg-emerald-50 text-emerald-900';
  if (band === 'Amber') return 'border-amber-300 bg-amber-50 text-amber-900';
  return 'border-rose-300 bg-rose-50 text-rose-900';
}

function classifySpellingError(expected: string, typedRaw: string): string {
  const typed = typedRaw.trim().toLowerCase();
  const target = expected.trim().toLowerCase();
  if (!typed) return 'Skipped / blank entry';

  if (
    (target.includes('b') && typed.includes('d') && typed.replace(/d/g, 'b') === target) ||
    (target.includes('d') && typed.includes('b') && typed.replace(/b/g, 'd') === target)
  ) {
    return 'Swapped letters (b/d)';
  }
  if (
    (target.includes('p') && typed.includes('q') && typed.replace(/q/g, 'p') === target) ||
    (target.includes('q') && typed.includes('p') && typed.replace(/p/g, 'q') === target)
  ) {
    return 'Swapped letters (p/q)';
  }
  if (
    typed.length === target.length &&
    [...typed].sort().join('') === [...target].sort().join('')
  ) {
    return 'Letter order swap';
  }
  if (typed.length < target.length) {
    return 'Omitted letters';
  }
  return 'Phonetic / extra letter substitution';
}

const GAME_ORDER: ReadingGameId[] = ['sound', 'letter-sound', 'nonword', 'spelling', 'memory'];

export const ReadingCheckFlow: React.FC<ReadingCheckFlowProps> = ({
  standalone = false,
  onBack,
  onJumpToReadingWorld,
}) => {
  const {
    activeRole,
    activeStudent,
    readingCheckResults,
    saveReadingGameResult,
    updateCheckStatus,
    soundEnabled,
    prefersReducedMotion,
    logStudentActivity,
  } = useAppData();

  const isAdultPortal = !standalone && (activeRole === 'parent' || activeRole === 'school');
  const existing = readingCheckResults[activeStudent.id];

  const [language, setLanguage] = useState<ReadingLanguage>(existing?.language ?? 'en');
  const [stage, setStage] = useState<'overview' | ReadingGameId | 'finished'>('overview');
  const [trialIdx, setTrialIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [rts, setRts] = useState<number[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  // Spelling input state
  const [spellingInput, setSpellingInput] = useState('');

  // Memory span state
  const [memoryPlaying, setMemoryPlaying] = useState(false);
  const [memoryHighlightIdx, setMemoryHighlightIdx] = useState<number | null>(null);
  const [memoryTyped, setMemoryTyped] = useState<string[]>([]);

  const trialStartRef = useRef<number>(0);
  const memoryTimerRefs = useRef<number[]>([]);

  const bank = READING_BANKS[language];

  const clearMemoryTimers = () => {
    memoryTimerRefs.current.forEach((id) => window.clearTimeout(id));
    memoryTimerRefs.current = [];
  };

  useEffect(() => {
    return () => {
      clearMemoryTimers();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Auto-speak question when entering a new trial
  useEffect(() => {
    if (stage === 'sound') {
      const q = bank.sound[trialIdx];
      if (q) speakText(q.speechPrompt, language);
      trialStartRef.current = performance.now();
    } else if (stage === 'letter-sound') {
      const q = bank.letterSound[trialIdx];
      if (q) speakText(q.speechPrompt, language);
      trialStartRef.current = performance.now();
    } else if (stage === 'nonword') {
      trialStartRef.current = performance.now();
    } else if (stage === 'spelling') {
      const q = bank.spelling[trialIdx];
      if (q) speakText(q.speechPrompt, language);
      setSpellingInput('');
      trialStartRef.current = performance.now();
    } else if (stage === 'memory') {
      const m = bank.memory[trialIdx];
      if (m) {
        playMemorySequence(m);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, trialIdx, language]);

  const playMemorySequence = (trial: MemoryTrial) => {
    clearMemoryTimers();
    setMemoryTyped([]);
    setMemoryPlaying(true);
    setMemoryHighlightIdx(null);

    speakText(trial.speechText, language);

    trial.sequence.forEach((_, idx) => {
      const tOn = window.setTimeout(() => {
        setMemoryHighlightIdx(idx);
      }, idx * 720);
      memoryTimerRefs.current.push(tOn);
    });

    const tDone = window.setTimeout(() => {
      setMemoryHighlightIdx(null);
      setMemoryPlaying(false);
      trialStartRef.current = performance.now();
    }, trial.sequence.length * 720 + 250);
    memoryTimerRefs.current.push(tDone);
  };

  const handleHearAgain = () => {
    if (stage === 'sound') {
      const q = bank.sound[trialIdx];
      if (q) speakText(q.speechPrompt, language);
    } else if (stage === 'letter-sound') {
      const q = bank.letterSound[trialIdx];
      if (q) speakText(q.speechPrompt, language);
    } else if (stage === 'nonword') {
      speakText(bank.hearPromptText, language);
    } else if (stage === 'spelling') {
      const q = bank.spelling[trialIdx];
      if (q) speakText(q.speechPrompt, language);
    } else if (stage === 'memory') {
      const m = bank.memory[trialIdx];
      if (m) playMemorySequence(m);
    }
  };

  const startAllGames = () => {
    playSoftTap(soundEnabled);
    updateCheckStatus(activeStudent.id, 'reading', 'In progress');
    setTrialIdx(0);
    setCorrectCount(0);
    setRts([]);
    setErrors([]);
    setStage('sound');
  };

  const advanceOrFinishGame = (
    gameId: ReadingGameId,
    title: string,
    finalCorrect: number,
    totalTrials: number,
    finalRts: number[],
    finalErrors: string[]
  ) => {
    const pct = Math.round((finalCorrect / totalTrials) * 100);
    const uniqueErrors = Array.from(new Set(finalErrors));
    const metrics: ReadingGameMetrics = {
      gameId,
      title,
      language,
      accuracyPct: pct,
      medianRtMs: medianMs(finalRts),
      correctCount: finalCorrect,
      totalTrials,
      errorTypes: uniqueErrors,
      band: readingBand(pct),
      completedAt: new Date().toISOString().slice(0, 10),
    };
    saveReadingGameResult(activeStudent.id, metrics);

    const currentOrderIdx = GAME_ORDER.indexOf(gameId);
    const nextGame = GAME_ORDER[currentOrderIdx + 1];

    setTrialIdx(0);
    setCorrectCount(0);
    setRts([]);
    setErrors([]);

    if (nextGame) {
      playGentleSuccess(soundEnabled);
      setStage(nextGame);
    } else {
      playCelebrationChord(soundEnabled);
      logStudentActivity({
        studentId: activeStudent.id,
        module: 'Reading World',
        activityTitle: `Let's Check: Reading Check (${LANGUAGE_OPTIONS.find((l) => l.id === language)?.label ?? 'English'})`,
        durationMinutes: 7,
        status: 'Completed',
        studentFeedback: 'Completed all 5 Reading Check games.',
        feelingTag: 'Curious',
        achievementTitle: 'Sound Detective',
        achievementDescription: 'Completed all five Reading Check games.',
      });
      setStage('finished');
    }
  };

  const handleSoundPick = (picked: string) => {
    const rt = Math.max(120, Math.round(performance.now() - trialStartRef.current));
    const q = bank.sound[trialIdx];
    const isCorrect = picked === q.answer;
    playSoftTap(soundEnabled);

    const nextCorrect = correctCount + (isCorrect ? 1 : 0);
    const nextRts = [...rts, rt];
    const nextErrors = isCorrect
      ? errors
      : [...errors, q.kind === 'rhyme' ? 'Rhyme mismatch' : 'Starting sound confusion'];

    if (trialIdx + 1 < bank.sound.length) {
      setCorrectCount(nextCorrect);
      setRts(nextRts);
      setErrors(nextErrors);
      setTrialIdx((i) => i + 1);
    } else {
      advanceOrFinishGame(
        'sound',
        '1. Sound Game',
        nextCorrect,
        bank.sound.length,
        nextRts,
        nextErrors
      );
    }
  };

  const handleLetterPick = (picked: string) => {
    const rt = Math.max(120, Math.round(performance.now() - trialStartRef.current));
    const q = bank.letterSound[trialIdx];
    const isCorrect = picked === q.answer;
    playSoftTap(soundEnabled);

    const nextCorrect = correctCount + (isCorrect ? 1 : 0);
    const nextRts = [...rts, rt];
    const errLabel = q.pairLabel
      ? `Swapped letters (${q.pairLabel})`
      : 'Letter-sound mismatch';
    const nextErrors = isCorrect ? errors : [...errors, errLabel];

    if (trialIdx + 1 < bank.letterSound.length) {
      setCorrectCount(nextCorrect);
      setRts(nextRts);
      setErrors(nextErrors);
      setTrialIdx((i) => i + 1);
    } else {
      advanceOrFinishGame(
        'letter-sound',
        '2. Letter-Sound Matching',
        nextCorrect,
        bank.letterSound.length,
        nextRts,
        nextErrors
      );
    }
  };

  const handleNonwordRate = (readWell: boolean) => {
    const rt = Math.max(150, Math.round(performance.now() - trialStartRef.current));
    const item = bank.nonword[trialIdx];
    playSoftTap(soundEnabled);

    const nextCorrect = correctCount + (readWell ? 1 : 0);
    const nextRts = [...rts, rt];
    const nextErrors = readWell ? errors : [...errors, item.patternNote];

    if (trialIdx + 1 < bank.nonword.length) {
      setCorrectCount(nextCorrect);
      setRts(nextRts);
      setErrors(nextErrors);
      setTrialIdx((i) => i + 1);
    } else {
      advanceOrFinishGame(
        'nonword',
        '3. Made-Up Word Reading',
        nextCorrect,
        bank.nonword.length,
        nextRts,
        nextErrors
      );
    }
  };

  const handleSpellingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spellingInput.trim()) return;
    const rt = Math.max(200, Math.round(performance.now() - trialStartRef.current));
    const item = bank.spelling[trialIdx];
    const cleanTyped = spellingInput.trim().toLowerCase();
    const isCorrect = cleanTyped === item.word.toLowerCase();
    playSoftTap(soundEnabled);

    const nextCorrect = correctCount + (isCorrect ? 1 : 0);
    const nextRts = [...rts, rt];
    const nextErrors = isCorrect
      ? errors
      : [...errors, classifySpellingError(item.word, spellingInput)];

    if (trialIdx + 1 < bank.spelling.length) {
      setCorrectCount(nextCorrect);
      setRts(nextRts);
      setErrors(nextErrors);
      setTrialIdx((i) => i + 1);
    } else {
      advanceOrFinishGame(
        'spelling',
        '4. Spelling From Audio',
        nextCorrect,
        bank.spelling.length,
        nextRts,
        nextErrors
      );
    }
  };

  const handleMemorySubmit = () => {
    const trial = bank.memory[trialIdx];
    const rt = Math.max(200, Math.round(performance.now() - trialStartRef.current));
    const isCorrect =
      memoryTyped.length === trial.sequence.length &&
      memoryTyped.every((v, idx) => v === trial.sequence[idx]);
    playSoftTap(soundEnabled);

    let errTag = 'Sequence recall error';
    if (!isCorrect) {
      if (memoryTyped.length < trial.sequence.length) {
        errTag = 'Omitted item in sequence';
      } else if (
        [...memoryTyped].sort().join(',') === [...trial.sequence].sort().join(',')
      ) {
        errTag = 'Swapped sequence order';
      }
    }

    const nextCorrect = correctCount + (isCorrect ? 1 : 0);
    const nextRts = [...rts, rt];
    const nextErrors = isCorrect ? errors : [...errors, errTag];

    if (trialIdx + 1 < bank.memory.length) {
      setCorrectCount(nextCorrect);
      setRts(nextRts);
      setErrors(nextErrors);
      setTrialIdx((i) => i + 1);
    } else {
      advanceOrFinishGame(
        'memory',
        '5. Memory Span',
        nextCorrect,
        bank.memory.length,
        nextRts,
        nextErrors
      );
    }
  };

  const savedCards = useMemo(() => {
    if (!existing) return [];
    return [
      existing.sound,
      existing['letter-sound'],
      existing.nonword,
      existing.spelling,
      existing.memory,
    ].filter(Boolean) as ReadingGameMetrics[];
  }, [existing]);

  const hearButton = (
    <button
      type="button"
      onClick={handleHearAgain}
      className="inline-flex items-center gap-2 rounded-2xl border-2 border-sky-400 bg-[#E0F2FE] px-4 py-2 text-xs sm:text-sm font-bold text-sky-950 hover:bg-sky-200 cursor-pointer"
    >
      <Volume2 className="h-4 w-4" aria-hidden="true" />
      Hear it again
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            clearMemoryTimers();
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
              window.speechSynthesis.cancel();
            }
            onBack();
          }}
          className="inline-flex items-center gap-1.5 rounded-2xl border-2 border-slate-300 bg-white px-4 py-2 text-xs sm:text-sm font-bold text-slate-800 hover:bg-slate-50 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Let&apos;s Check
        </button>

        {/* Language Selector: English first, with Hindi and Kannada */}
        <div className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white p-1">
          {LANGUAGE_OPTIONS.map((langOpt) => {
            const active = language === langOpt.id;
            return (
              <button
                key={langOpt.id}
                type="button"
                onClick={() => {
                  setLanguage(langOpt.id);
                  setTrialIdx(0);
                  setCorrectCount(0);
                  setRts([]);
                  setErrors([]);
                  if (stage !== 'overview' && stage !== 'finished') {
                    setStage('overview');
                  }
                }}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                  active
                    ? 'bg-sky-700 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {langOpt.label} ({langOpt.native})
              </button>
            );
          })}
        </div>
      </div>

      {stage === 'overview' && (
        <div className="space-y-6">
          <div className="rounded-3xl border-2 border-sky-300 bg-[#E0F2FE]/55 p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-900">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
              <span>Reading Check · 6–8 minutes</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
              Five Quick Sound, Letter &amp; Reading Games
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs sm:text-sm">
              <div className="rounded-2xl border border-sky-200 bg-white p-3.5">
                <p className="font-bold text-slate-900">1. Sound Game</p>
                <p className="mt-1 text-slate-600">8 questions on rhymes &amp; starting sounds.</p>
              </div>
              <div className="rounded-2xl border border-sky-200 bg-white p-3.5">
                <p className="font-bold text-slate-900">2. Letter-Sound</p>
                <p className="mt-1 text-slate-600">10 quick sound-to-letter taps.</p>
              </div>
              <div className="rounded-2xl border border-sky-200 bg-white p-3.5">
                <p className="font-bold text-slate-900">3. Made-Up Words</p>
                <p className="mt-1 text-slate-600">8 words read aloud with a helper.</p>
              </div>
              <div className="rounded-2xl border border-sky-200 bg-white p-3.5">
                <p className="font-bold text-slate-900">4. Audio Spelling</p>
                <p className="mt-1 text-slate-600">8 short spoken words to type.</p>
              </div>
              <div className="rounded-2xl border border-sky-200 bg-white p-3.5">
                <p className="font-bold text-slate-900">5. Memory Span</p>
                <p className="mt-1 text-slate-600">Repeat sequences up to 6 items.</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={startAllGames}
                className="inline-flex items-center gap-2 rounded-2xl bg-sky-700 px-6 py-3.5 text-sm sm:text-base font-bold text-white hover:bg-sky-800 cursor-pointer"
              >
                <Play className="h-5 w-5" aria-hidden="true" />
                Start Reading Check
              </button>
              <button
                type="button"
                onClick={onJumpToReadingWorld}
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 hover:bg-slate-50 cursor-pointer"
              >
                Try the Reading World
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {isAdultPortal && savedCards.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-lg font-bold text-slate-900">
                  Reading Check Results ({activeStudent.name})
                </h3>
                <span className="text-xs font-medium text-slate-600">Indicative results</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedCards.map((card) => (
                  <div
                    key={card.gameId}
                    className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-slate-900">{card.title}</span>
                      <span
                        className={`rounded-md border px-2 py-0.5 text-xs font-bold ${bandClasses(
                          card.band
                        )}`}
                      >
                        Indicative result: {card.band}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-4 font-mono text-xs sm:text-sm tabular-nums text-slate-800">
                      <span>Accuracy: {card.accuracyPct}%</span>
                      <span>Median: {(card.medianRtMs / 1000).toFixed(2)}s</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      {card.errorTypes.length > 0
                        ? `Noted patterns: ${card.errorTypes.join(', ')}`
                        : 'No recurring error pattern noted.'}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500">
                Screening support tool. Results are not a medical diagnosis.
              </p>
            </div>
          )}
        </div>
      )}

      {/* GAME 1: SOUND GAME */}
      {stage === 'sound' && (
        <div className="rounded-3xl border-2 border-sky-300 bg-[#FFFDF7] p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-700">
              Game 1 of 5 · Sound Game ({trialIdx + 1} / {bank.sound.length})
            </span>
            {hearButton}
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 text-center">
            {bank.sound[trialIdx].prompt}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {bank.sound[trialIdx].options.map((opt) => (
              <motion.button
                key={`${trialIdx}-${opt}`}
                type="button"
                whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                onClick={() => handleSoundPick(opt)}
                className="rounded-3xl border-2 border-sky-300 bg-white py-6 px-4 font-display text-2xl font-bold text-[#0B1D3A] hover:border-sky-600 hover:bg-[#E0F2FE]/50 cursor-pointer"
              >
                {opt}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* GAME 2: LETTER-SOUND MATCHING */}
      {stage === 'letter-sound' && (
        <div className="rounded-3xl border-2 border-sky-300 bg-[#FFFDF7] p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-700">
              Game 2 of 5 · Letter-Sound Matching ({trialIdx + 1} / {bank.letterSound.length})
            </span>
            {hearButton}
          </div>

          <div className="text-center space-y-2">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
              Listen to the sound, then tap the matching letter
            </h2>
            <p className="text-sm font-semibold text-sky-800">
              Sound cue: {bank.letterSound[trialIdx].soundCue}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {bank.letterSound[trialIdx].options.map((letter) => (
              <motion.button
                key={`${trialIdx}-${letter}`}
                type="button"
                whileHover={prefersReducedMotion ? undefined : { scale: 1.03 }}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
                onClick={() => handleLetterPick(letter)}
                className="rounded-3xl border-2 border-sky-300 bg-white py-8 font-display text-4xl font-bold text-[#0B1D3A] hover:border-sky-600 hover:bg-[#E0F2FE]/55 cursor-pointer"
              >
                {letter}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* GAME 3: MADE-UP WORD READING */}
      {stage === 'nonword' && (
        <div className="rounded-3xl border-2 border-sky-300 bg-[#FFFDF7] p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-700">
              Game 3 of 5 · Made-Up Word Reading ({trialIdx + 1} / {bank.nonword.length})
            </span>
            {hearButton}
          </div>

          <div className="text-center space-y-3">
            <p className="text-sm font-semibold text-slate-600">
              Ask the child to read this silly made-up word out loud:
            </p>
            <div className="mx-auto max-w-md rounded-3xl border-2 border-sky-200 bg-white py-10 px-6">
              <span className="font-display text-5xl sm:text-6xl font-bold tracking-wide text-[#0B1D3A]">
                {bank.nonword[trialIdx].word}
              </span>
            </div>
          </div>

          <div className="mx-auto max-w-md space-y-2 text-center">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Parent or teacher tap
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleNonwordRate(true)}
                className="rounded-2xl border-2 border-emerald-400 bg-[#D1FAE5] px-5 py-4 text-sm sm:text-base font-bold text-emerald-950 hover:bg-emerald-200 cursor-pointer"
              >
                Read it well
              </button>
              <button
                type="button"
                onClick={() => handleNonwordRate(false)}
                className="rounded-2xl border-2 border-amber-400 bg-[#FEF9C3] px-5 py-4 text-sm sm:text-base font-bold text-amber-950 hover:bg-amber-200 cursor-pointer"
              >
                Found it tricky
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GAME 4: SPELLING FROM AUDIO */}
      {stage === 'spelling' && (
        <div className="rounded-3xl border-2 border-sky-300 bg-[#FFFDF7] p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-700">
              Game 4 of 5 · Spelling From Audio ({trialIdx + 1} / {bank.spelling.length})
            </span>
            {hearButton}
          </div>

          <div className="text-center space-y-2">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
              Listen to the word and type it below
            </h2>
            <p className="text-xs sm:text-sm font-medium text-slate-600">
              Clue: {bank.spelling[trialIdx].hintCue}
            </p>
          </div>

          <form onSubmit={handleSpellingSubmit} className="mx-auto max-w-md space-y-4">
            <input
              type="text"
              autoFocus
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              value={spellingInput}
              onChange={(e) => setSpellingInput(e.target.value)}
              placeholder="Type the word here..."
              aria-label="Type the word you heard"
              className="w-full rounded-2xl border-2 border-sky-300 bg-white px-5 py-4 text-center font-display text-2xl font-bold text-slate-900 focus:border-sky-600 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!spellingInput.trim()}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-700 px-6 py-3.5 text-sm sm:text-base font-bold text-white hover:bg-sky-800 disabled:opacity-45 cursor-pointer"
            >
              {trialIdx + 1 < bank.spelling.length ? 'Save & Next Word' : 'Next Game: Memory Span'}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        </div>
      )}

      {/* GAME 5: MEMORY SPAN */}
      {stage === 'memory' && (
        <div className="rounded-3xl border-2 border-sky-300 bg-[#FFFDF7] p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-700">
              Game 5 of 5 · Memory Span ({trialIdx + 1} / {bank.memory.length} ·{' '}
              {bank.memory[trialIdx].sequence.length} items)
            </span>
            {hearButton}
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 text-center">
            {memoryPlaying
              ? 'Watch and listen closely...'
              : 'Now tap the items in the exact same order!'}
          </h2>

          {/* Sequence display during playback, hidden during recall */}
          <div className="flex flex-wrap justify-center gap-3 min-h-[72px]">
            {bank.memory[trialIdx].sequence.map((item, idx) => {
              const isShowingNow = memoryPlaying && memoryHighlightIdx === idx;
              const recalledVal = memoryTyped[idx];
              return (
                <div
                  key={idx}
                  className={`h-16 w-16 rounded-2xl border-2 flex items-center justify-center font-display text-2xl font-bold transition-colors ${
                    isShowingNow
                      ? 'border-amber-400 bg-[#FEF9C3] text-slate-900'
                      : recalledVal
                        ? 'border-sky-500 bg-[#E0F2FE] text-[#0B1D3A]'
                        : 'border-slate-200 bg-white text-slate-400'
                  }`}
                >
                  {isShowingNow ? item : !memoryPlaying && recalledVal ? recalledVal : '•'}
                </div>
              );
            })}
          </div>

          {/* Interactive keypad once playback finishes */}
          <div className="mx-auto max-w-lg space-y-4">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {bank.memory[trialIdx].keypad.map((keyChar) => (
                <button
                  key={keyChar}
                  type="button"
                  disabled={
                    memoryPlaying || memoryTyped.length >= bank.memory[trialIdx].sequence.length
                  }
                  onClick={() => {
                    playSoftTap(soundEnabled);
                    setMemoryTyped((prev) => [...prev, keyChar]);
                  }}
                  className="rounded-2xl border-2 border-sky-300 bg-white py-4 font-display text-2xl font-bold text-[#0B1D3A] hover:bg-[#E0F2FE]/50 disabled:opacity-45 cursor-pointer"
                >
                  {keyChar}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={memoryPlaying || memoryTyped.length === 0}
                  onClick={() => setMemoryTyped((prev) => prev.slice(0, -1))}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-45 cursor-pointer"
                >
                  <Delete className="h-4 w-4" aria-hidden="true" />
                  Undo
                </button>
                <button
                  type="button"
                  disabled={memoryPlaying || memoryTyped.length === 0}
                  onClick={() => setMemoryTyped([])}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-45 cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Clear
                </button>
              </div>

              <button
                type="button"
                disabled={
                  memoryPlaying || memoryTyped.length !== bank.memory[trialIdx].sequence.length
                }
                onClick={handleMemorySubmit}
                className="inline-flex items-center gap-2 rounded-2xl bg-sky-700 px-6 py-3 text-sm font-bold text-white hover:bg-sky-800 disabled:opacity-45 cursor-pointer"
              >
                {trialIdx + 1 < bank.memory.length ? 'Check & Next' : 'Finish Reading Check'}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPLETION SCREEN */}
      {stage === 'finished' && (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.35 }}
          className="rounded-3xl border-2 border-sky-300 bg-[#FFFDF7] p-7 sm:p-10 space-y-6"
        >
          <div className="text-center space-y-4">
            <div className="flex justify-center gap-3">
              {[0, 1, 2].map((starIdx) => (
                <motion.div
                  key={starIdx}
                  initial={prefersReducedMotion ? false : { scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { delay: starIdx * 0.14, duration: 0.4 }
                  }
                  className="rounded-2xl border-2 border-amber-300 bg-[#FEF9C3] p-3.5"
                >
                  <Star className="h-8 w-8 fill-amber-400 text-amber-600" aria-hidden="true" />
                </motion.div>
              ))}
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
              Wonderful reading energy!
            </h2>

            {!isAdultPortal && (
              <p className="mx-auto max-w-md text-sm sm:text-base text-slate-700">
                You finished all five sound and word games! Want to explore stories and audio tools
                inside Reading World?
              </p>
            )}
          </div>

          {isAdultPortal && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-lg font-bold text-slate-900">
                  Reading Check Summary ({activeStudent.name})
                </h3>
                <span className="text-xs font-medium text-slate-600">Indicative results</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedCards.map((card) => (
                  <div
                    key={card.gameId}
                    className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-slate-900">{card.title}</span>
                      <span
                        className={`rounded-md border px-2 py-0.5 text-xs font-bold ${bandClasses(
                          card.band
                        )}`}
                      >
                        Indicative result: {card.band}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-4 font-mono text-sm tabular-nums text-slate-800">
                      <span>Accuracy: {card.accuracyPct}%</span>
                      <span>Median: {(card.medianRtMs / 1000).toFixed(2)}s</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      {card.errorTypes.length > 0
                        ? `Noted patterns: ${card.errorTypes.join(', ')}`
                        : 'No recurring error pattern noted.'}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 text-center">
                Screening support tool. Results are not a medical diagnosis.
              </p>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onJumpToReadingWorld}
              className="inline-flex items-center gap-2 rounded-2xl bg-sky-700 px-6 py-3 text-sm font-bold text-white hover:bg-sky-800 cursor-pointer"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Try the Reading World
            </button>
            <button
              type="button"
              onClick={onBack}
              className="rounded-2xl border-2 border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 hover:bg-slate-50 cursor-pointer"
            >
              Back to All Checks
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
