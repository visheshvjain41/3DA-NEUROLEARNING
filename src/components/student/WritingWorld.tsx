import React, { useState } from 'react';
import { CheckCircle2, Mic, PenTool, Plus, Sparkles } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';

const SENTENCE_STARTERS = [
  'One thing that really surprised me was...',
  'First, I noticed how...',
  'The biggest clue in the story was...',
  'Next time, I would like to explore...',
];

const SIMULATED_VOICE_SNIPPETS = [
  'I want to write about how rain clouds form over warm ocean water.',
  'Then the tiny droplets bump together until they get heavy enough to fall.',
  'Finally I can draw a simple cycle diagram instead of writing a huge page.',
];

interface WritingWorldProps {
  onActivityLogged: (msg: string) => void;
}

export const WritingWorld: React.FC<WritingWorldProps> = ({ onActivityLogged }) => {
  const { activeStudent, logStudentActivity, saveWritingArtifact } = useAppData();
  const [subMode, setSubMode] = useState<'outline-studio' | 'homework-builder'>('outline-studio');

  // Idea & Outline Studio
  const [brainstorm, setBrainstorm] = useState(
    'Rain clouds start over warm water. Droplets rise and cool down.'
  );
  const [outlineTitle, setOutlineTitle] = useState('How Rain Clouds Form');
  const [outlineBeginning, setOutlineBeginning] = useState(
    'Beginning: Warm sunlight heats water on the ocean surface.'
  );
  const [outlineMiddle, setOutlineMiddle] = useState(
    'Middle Details: Cool air turns invisible vapor into tiny cloud droplets.'
  );
  const [outlineWrap, setOutlineWrap] = useState(
    'Wrap-up: Heavy droplets fall back as rain to feed rivers and plants.'
  );
  const [voiceIdx, setVoiceIdx] = useState(0);

  // Homework Builder
  const [hwPrompt, setHwPrompt] = useState('Write a 1-paragraph science reflection on magnets');
  const [hwSteps, setHwSteps] = useState<Array<{ id: string; text: string; done: boolean }>>([
    { id: '1', text: 'Pick 2 objects that stuck to the magnet in class', done: true },
    { id: '2', text: 'Say one sentence aloud about why they moved', done: false },
    { id: '3', text: 'Type 3 short bullet ideas in your outline', done: false },
    { id: '4', text: 'Read it once with comfort spacing', done: false },
  ]);
  const [newStepText, setNewStepText] = useState('');

  const handleSimulatedVoiceCapture = () => {
    const snippet = SIMULATED_VOICE_SNIPPETS[voiceIdx % SIMULATED_VOICE_SNIPPETS.length];
    setVoiceIdx((v) => v + 1);
    setBrainstorm((prev) => (prev.trim() ? `${prev.trim()} ${snippet}` : snippet));
  };

  const handleConvertToOutline = () => {
    const sentences = brainstorm
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    setOutlineBeginning(`Beginning: ${sentences[0] || 'Introduce your main idea simply.'}`);
    setOutlineMiddle(
      `Middle Details: ${sentences[1] || 'Add one or two supporting examples.'}`
    );
    setOutlineWrap(
      `Wrap-up: ${sentences[2] || 'Share what you found most interesting.'}`
    );
  };

  const handleSaveOutline = () => {
    const items = [outlineBeginning, outlineMiddle, outlineWrap];
    saveWritingArtifact(activeStudent.id, {
      type: 'outline',
      title: outlineTitle.trim() || 'My Idea Outline',
      items,
    });
    logStudentActivity({
      studentId: activeStudent.id,
      module: 'Writing World',
      activityTitle: `Idea & Outline Studio: ${outlineTitle.trim() || 'Story Map'}`,
      durationMinutes: 12,
      status: 'Completed',
      studentFeedback: 'Organized my ideas into a 3-part outline without stress.',
      feelingTag: 'Proud',
      achievementTitle: 'Idea Architect',
      achievementDescription: 'Turned brainstorm notes into a clear 3-part outline.',
    });
    onActivityLogged('Outline saved to your Writing artifacts and activity log!');
  };

  const handleSplitHomework = () => {
    const topic = hwPrompt.trim() || 'My Assignment';
    setHwSteps([
      { id: `${Date.now()}-1`, text: `Read the prompt for "${topic}" once steadily`, done: false },
      { id: `${Date.now()}-2`, text: 'Jot down or speak 3 quick keywords', done: false },
      { id: `${Date.now()}-3`, text: 'Draft the opening sentence using a starter', done: false },
      { id: `${Date.now()}-4`, text: 'Add 2 supporting details and pause for a breath', done: false },
    ]);
  };

  const handleAddCustomStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStepText.trim()) return;
    setHwSteps((prev) => [
      ...prev,
      { id: `${Date.now()}`, text: newStepText.trim(), done: false },
    ]);
    setNewStepText('');
  };

  const handleSaveHomework = () => {
    saveWritingArtifact(activeStudent.id, {
      type: 'checklist',
      title: hwPrompt.trim() || 'Homework Plan',
      items: hwSteps.map((s) => `${s.done ? '[Done] ' : ''}${s.text}`),
    });
    logStudentActivity({
      studentId: activeStudent.id,
      module: 'Writing World',
      activityTitle: `Homework Builder: ${hwPrompt.trim() || 'Assignment Plan'}`,
      durationMinutes: 9,
      status: 'Completed',
      studentFeedback: 'Split my homework into editable steps.',
      feelingTag: 'Steady',
    });
    onActivityLogged('Homework step checklist saved to your workspace!');
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-2.5 text-amber-700">
            <PenTool className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">
              Writing World · Dysgraphia Support
            </h2>
            <p className="text-xs text-slate-500">
              Focuses on organizing big ideas clearly—never grading handwriting or spelling speed.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 self-start">
          <button
            type="button"
            onClick={() => setSubMode('outline-studio')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold cursor-pointer ${
              subMode === 'outline-studio'
                ? 'bg-white text-amber-900 shadow-xs'
                : 'text-slate-600'
            }`}
          >
            Idea &amp; Outline Studio
          </button>
          <button
            type="button"
            onClick={() => setSubMode('homework-builder')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold cursor-pointer ${
              subMode === 'homework-builder'
                ? 'bg-white text-amber-900 shadow-xs'
                : 'text-slate-600'
            }`}
          >
            Homework Builder
          </button>
        </div>
      </div>

      {subMode === 'outline-studio' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-slate-900">
                1. Capture Messy Ideas
              </h3>
              <button
                type="button"
                onClick={handleSimulatedVoiceCapture}
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100 cursor-pointer"
              >
                <Mic className="h-3.5 w-3.5" aria-hidden="true" />
                Simulate Voice Idea
              </button>
            </div>

            <div>
              <label htmlFor="ww-title" className="block text-xs font-semibold text-slate-700 mb-1">
                Topic Title
              </label>
              <input
                id="ww-title"
                type="text"
                value={outlineTitle}
                onChange={(e) => setOutlineTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label htmlFor="ww-brain" className="block text-xs font-semibold text-slate-700 mb-1">
                Type or speak thoughts in any order
              </label>
              <textarea
                id="ww-brain"
                rows={4}
                value={brainstorm}
                onChange={(e) => setBrainstorm(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm leading-relaxed"
              />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-600 mb-2">
                Helpful Sentence Starters (tap to add)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SENTENCE_STARTERS.map((starter) => (
                  <button
                    key={starter}
                    type="button"
                    onClick={() =>
                      setBrainstorm((prev) => `${prev.trim()} ${starter}`.trim())
                    }
                    className="rounded-lg border border-slate-200 bg-[#FAF9F6] px-2.5 py-1 text-xs text-slate-700 hover:bg-amber-50 cursor-pointer"
                  >
                    + {starter}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleConvertToOutline}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-amber-700 cursor-pointer"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Turn Ideas into 3-Part Outline
            </button>
          </div>

          <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
            <h3 className="font-display text-lg font-semibold text-slate-900">
              2. Editable Outline Workspace
            </h3>
            <div className="space-y-3">
              <div>
                <label htmlFor="out-beg" className="block text-xs font-semibold text-slate-600 mb-1">
                  Card 1 · Beginning
                </label>
                <textarea
                  id="out-beg"
                  rows={2}
                  value={outlineBeginning}
                  onChange={(e) => setOutlineBeginning(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-[#FAF9F6] px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label htmlFor="out-mid" className="block text-xs font-semibold text-slate-600 mb-1">
                  Card 2 · Middle Details
                </label>
                <textarea
                  id="out-mid"
                  rows={2}
                  value={outlineMiddle}
                  onChange={(e) => setOutlineMiddle(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-[#FAF9F6] px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label htmlFor="out-end" className="block text-xs font-semibold text-slate-600 mb-1">
                  Card 3 · Wrap-Up
                </label>
                <textarea
                  id="out-end"
                  rows={2}
                  value={outlineWrap}
                  onChange={(e) => setOutlineWrap(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-[#FAF9F6] px-3 py-2 text-sm"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveOutline}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-teal-700 cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Save Outline to Workspace
            </button>
          </div>
        </div>
      ) : (
        /* HOMEWORK BUILDER */
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
          <div>
            <h3 className="font-display text-lg font-semibold text-slate-900">
              Homework Builder · Break Assignments into Steps
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Type any assignment and split it into small, clear checkboxes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              aria-label="Assignment prompt"
              value={hwPrompt}
              onChange={(e) => setHwPrompt(e.target.value)}
              className="flex-1 rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm"
            />
            <button
              type="button"
              onClick={handleSplitHomework}
              className="rounded-lg bg-amber-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-amber-700 cursor-pointer shrink-0"
            >
              Split into Steps
            </button>
          </div>

          <div className="space-y-2">
            {hwSteps.map((step) => (
              <label
                key={step.id}
                className={`flex items-center gap-3 rounded-xl border p-3.5 cursor-pointer transition-colors ${
                  step.done
                    ? 'border-teal-200 bg-teal-50/70 text-slate-500 line-through'
                    : 'border-slate-200 bg-[#FAF9F6] text-slate-800'
                }`}
              >
                <input
                  type="checkbox"
                  checked={step.done}
                  onChange={() =>
                    setHwSteps((prev) =>
                      prev.map((s) => (s.id === step.id ? { ...s, done: !s.done } : s))
                    )
                  }
                  className="h-4 w-4 accent-teal-600"
                />
                <span className="text-sm">{step.text}</span>
              </label>
            ))}
          </div>

          <form onSubmit={handleAddCustomStep} className="flex gap-2">
            <input
              type="text"
              value={newStepText}
              onChange={(e) => setNewStepText(e.target.value)}
              placeholder="Add your own small step..."
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Add Step
            </button>
          </form>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Saved outlines &amp; checklists: {activeStudent.savedArtifacts.length}
            </span>
            <button
              type="button"
              onClick={handleSaveHomework}
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Save Homework Plan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
