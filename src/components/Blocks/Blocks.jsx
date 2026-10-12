import MarkdownView from '../MarkdownView/MarkdownView.jsx'
import CodeTrace from '../Interactive/CodeTrace.jsx'
import GrowthExplorer from '../Interactive/GrowthExplorer.jsx'
import RatioExplorer from '../Interactive/RatioExplorer.jsx'
import BoundChecker from '../Interactive/BoundChecker.jsx'
import LimitChecker from '../Interactive/LimitChecker.jsx'
import Quiz from '../Interactive/Quiz.jsx'
import Reveal from '../Interactive/Reveal.jsx'
import Stepper from '../Interactive/Stepper.jsx'
import Tabs from '../Interactive/Tabs.jsx'
import { traces } from '../../algorithms/traces.js'
import { quizProblem } from '../../lib/quiz.js'

/** Daftar bagian (teks dan penanda satu baris) di dalam sebuah item atau blok. */
export function SegmentList({ segments }) {
  return segments.map((seg, i) => <Block key={i} segment={seg} />)
}

const toItems = (items) => items.map((it) => ({ title: it.title, content: <SegmentList segments={it.segments} /> }))

/**
 * Menampilkan satu bagian hasil splitContent selain visualizer dan challenge.
 * Bagian yang datanya tidak sah (misalnya id peraga tidak dikenal) tampil sebagai catatan, bukan merusak halaman;
 * pemeriksa aturan penulisan (npm test) sudah melaporkannya sebagai error.
 */
export default function Block({ segment: seg }) {
  switch (seg.type) {
    case 'markdown':
      return <MarkdownView text={seg.text} />
    case 'steps':
      return seg.items.length ? <Stepper title={seg.title || 'Slide'} items={toItems(seg.items)} /> : null
    case 'tabs':
      return seg.items.length ? <Tabs title={seg.title || 'Tab'} items={toItems(seg.items)} /> : null
    case 'reveal':
      return (
        <Reveal title={seg.title || 'Lihat selengkapnya'}>
          <SegmentList segments={seg.segments} />
        </Reveal>
      )
    case 'quiz': {
      const questions = seg.questions
        .filter((q) => quizProblem(q) === null)
        .map((q) => ({ ...q, explanation: q.explanation ? <MarkdownView text={q.explanation} /> : null }))
      return questions.length ? <Quiz title={seg.title || 'Cek pemahaman'} questions={questions} /> : null
    }
    case 'growth':
      return <GrowthExplorer keys={seg.keys} />
    case 'ratio':
      return <RatioExplorer keys={seg.keys} n1={seg.n1} n2={seg.n2} />
    case 'bound':
      return <BoundChecker notation={seg.notation} coefs={seg.coefs} g={seg.g} consts={seg.consts} />
    case 'limit':
      return <LimitChecker f={seg.f} g={seg.g} c={seg.c} />
    case 'trace':
      return traces[seg.id] ? (
        <CodeTrace key={seg.id} def={traces[seg.id]} />
      ) : (
        <p className="my-4 rounded-xl border-2 border-dashed border-stone-700 bg-orange-100 p-4">Peraga &quot;{seg.id}&quot; belum tersedia.</p>
      )
    default:
      return null
  }
}
