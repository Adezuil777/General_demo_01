import { useEffect, useState } from 'react'
import './App.css'

type CoreState = {
  name: string
  affection: number
  money: number
  deaths: number
}

type SceneId =
  | 'intro'
  | 'chapter1_market'
  | 'chapter1_inn'
  | 'chapter1_mansion'
  | 'chapter2_slums'
  | 'chapter2_guild'
  | 'chapter2_square'
   | 'chapter3_court'
   | 'chapter3_balcony'
  | 'chapter4_crisis'
  | 'ending'

type Choice = {
  id: string
  label: string
}

type SceneResult = {
  nextScene: SceneId
  core: CoreState
  narrative: string[]
  dead: boolean
}

type HistoryEntry = {
  scene: SceneId
  choiceLabel: string
  deltaAffection: number
  deltaMoney: number
  deltaDeaths: number
  loop: number
}

type AchievementsState = {
  trueEnding: boolean
  perfectEnding: boolean
  firstDeath: boolean
  manyDeaths: boolean
  rich: boolean
  highAffection: boolean
}

const PAGE_SIZE = 5

function sceneTitle(id: SceneId): string {
  if (id === 'chapter1_market') return '集市邂逅'
  if (id === 'chapter1_inn') return '旅店夜袭'
  if (id === 'chapter1_mansion') return '宅邸生活'
  if (id === 'chapter2_slums') return '贫民区阴影'
  if (id === 'chapter2_guild') return '公会委托'
  if (id === 'chapter2_square') return '王城广场'
  if (id === 'chapter3_court') return '王选大厅'
  if (id === 'chapter3_balcony') return '高台夜谈'
  if (id === 'chapter4_crisis') return '崩坏边界'
  if (id === 'intro') return '序章·水边苏醒'
  if (id === 'ending') return '结局'
  return id
}

function App() {
  const saved = (() => {
    try {
      const raw = window.localStorage.getItem('isekai_loop_save_v1')
      if (!raw) {
        return null
      }
      return JSON.parse(raw) as {
        core: CoreState
        scene: SceneId
        text: string[]
        checkpointCore: CoreState | null
        checkpointScene: SceneId | null
        loopCount: number
        history?: HistoryEntry[]
        achievements?: AchievementsState
      }
    } catch {
      return null
    }
  })()
  const [scene, setScene] = useState<SceneId>(saved?.scene ?? 'intro')
  const [core, setCore] = useState<CoreState>(
    saved?.core ?? {
      name: '',
      affection: 0,
      money: 100,
      deaths: 0,
    },
  )
  const [loopCount, setLoopCount] = useState(saved?.loopCount ?? 0)
  const [pendingName, setPendingName] = useState('')
  const [text, setText] = useState<string[]>(
    saved?.text ?? [
      '你睁开眼睛，发现自己躺在异世界王都的水边。',
      '记忆有些混乱，只记得在原来的世界平凡地活着，然后——一阵刺痛与黑暗。',
    ],
  )
  const [choices, setChoices] = useState<Choice[]>([])
  const [checkpointCore, setCheckpointCore] = useState<CoreState | null>(saved?.checkpointCore ?? null)
  const [checkpointScene, setCheckpointScene] = useState<SceneId | null>(
    saved?.checkpointScene ?? null,
  )
  const [popup, setPopup] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>(saved?.history ?? [])
  const [achievements, setAchievements] = useState<AchievementsState>(
    saved?.achievements ?? {
      trueEnding: false,
      perfectEnding: false,
      firstDeath: false,
      manyDeaths: false,
      rich: false,
      highAffection: false,
    },
  )
  const [page, setPage] = useState(0)

  useEffect(() => {
    const data = {
      core,
      scene,
      text,
      checkpointCore,
      checkpointScene,
      loopCount,
      history,
      achievements,
    }
    window.localStorage.setItem('isekai_loop_save_v1', JSON.stringify(data))
  }, [core, scene, text, checkpointCore, checkpointScene, loopCount, history, achievements])

  function showPopup(message: string) {
    setPopup(message)
    window.setTimeout(() => {
      setPopup((current) => {
        if (current === message) {
          return null
        }
        return current
      })
    }, 2200)
  }

  function evaluateAchievements(coreState: CoreState, currentLoop: number, prev: AchievementsState) {
    const next: AchievementsState = { ...prev }
    if (coreState.deaths > 0) {
      next.firstDeath = true
    }
    if (coreState.deaths >= 5) {
      next.manyDeaths = true
    }
    if (coreState.money >= 150) {
      next.rich = true
    }
    if (coreState.affection >= 10) {
      next.highAffection = true
    }
    if (coreState.deaths >= 3 && coreState.affection >= 8 && coreState.money >= 60) {
      next.trueEnding = true
    } else if (coreState.affection >= 8 && coreState.money >= 80) {
      next.perfectEnding = true
    }
    return next
  }

  function startGame() {
    const baseName = pendingName.trim() || '无名之人'
    const bonusMoney = loopCount * 20
    const baseMoney = 100 + bonusMoney
    const baseAffection = loopCount >= 2 ? 1 : 0
    const nextCore: CoreState = {
      name: baseName,
      affection: baseAffection,
      money: baseMoney,
      deaths: 0,
    }
    setCore(nextCore)
    const introLines = [
      `${baseName}，欢迎来到这个充满魔法与阴谋的世界。`,
      '空气中弥漫着陌生的花香与金属气味，远处城墙上旗帜猎猎作响。',
      '你很快遇到了一位银发少女，她的身影仿佛将你从现实与梦境之间拉了出来。',
      '在你尚未理解发生了什么之前，命运的齿轮已经开始缓缓转动。',
      '',
      '第一章：王都的相遇',
      '傍晚的集市熙熙攘攘，你看到银发少女在寻找被盗的徽章。',
      '不远处几个可疑人物正朝巷子里走去。',
    ]
    setText(introLines)
    setScene('chapter1_market')
    setCheckpointCore(nextCore)
    setCheckpointScene('chapter1_market')
    setChoices([
      { id: '1', label: '立刻追上去帮她夺回徽章' },
      { id: '2', label: '提醒少女小心，但先观察情况' },
      { id: '3', label: '装作没看见，先去逛摊子' },
    ])
  }

  function withCheckpoint(nextScene: SceneId) {
    setCheckpointCore(core)
    setCheckpointScene(nextScene)
  }

  function applySceneResult(result: SceneResult) {
    if (result.dead) {
      const base = checkpointCore ?? core
      const revived: CoreState = {
        ...base,
        deaths: base.deaths + 1,
      }
      setCore(revived)
      if (checkpointScene) {
        setScene(checkpointScene)
      }
      setText([
        ...result.narrative,
        '',
        '一切归于黑暗，你的意识坠入深渊。',
        '当你再次睁开眼睛，发现自己回到了上一重要选择之前。',
      ])
      setChoices(sceneChoices(checkpointScene ?? scene))
      showPopup('死亡 +1（轮回回到上一选择）')
      return
    }
    const before = core
    const after = result.core
    const diffAffection = after.affection - before.affection
    const diffMoney = after.money - before.money
    const diffDeaths = after.deaths - before.deaths
    const changes: string[] = []
    if (diffAffection !== 0) {
      changes.push(`好感度 ${diffAffection > 0 ? '+' : ''}${diffAffection}`)
    }
    if (diffMoney !== 0) {
      changes.push(`资产 ${diffMoney > 0 ? '+' : ''}${diffMoney}G`)
    }
    if (diffDeaths !== 0) {
      changes.push(`死亡 ${diffDeaths > 0 ? '+' : ''}${diffDeaths}`)
    }
    setCore(result.core)
    setScene(result.nextScene)
    setText(result.narrative)
    setChoices(sceneChoices(result.nextScene))
    if (changes.length > 0) {
      showPopup(changes.join('，'))
      const entry: HistoryEntry = {
        scene: result.nextScene,
        choiceLabel: '',
        deltaAffection: diffAffection,
        deltaMoney: diffMoney,
        deltaDeaths: diffDeaths,
        loop: loopCount,
      }
      setHistory((prev) => [...prev.slice(-9), entry])
    }
    if (result.nextScene === 'ending') {
      setAchievements((prev) => evaluateAchievements(result.core, loopCount, prev))
    }
  }

  function sceneChoices(id: SceneId | null): Choice[] {
    if (id === 'chapter1_market') {
      return [
        { id: '0', label: '停下来思考当前处境（不推进剧情）' },
        { id: '1', label: '立刻追上去帮她夺回徽章' },
        { id: '2', label: '提醒少女小心，但先观察情况' },
        { id: '3', label: '装作没看见，先去逛摊子' },
      ]
    }
    if (id === 'chapter1_inn') {
      return [
        { id: '0', label: '停下来思考当前处境（不推进剧情）' },
        { id: '1', label: '立刻冲出去查看情况' },
        { id: '2', label: '先从门缝观察，再决定' },
        { id: '3', label: '装作没听见，继续睡觉' },
      ]
    }
    if (id === 'chapter1_mansion') {
      return [
        { id: '0', label: '停下来思考当前处境（不推进剧情）' },
        { id: '1', label: '认真学习礼仪，尽量不给女主丢脸' },
        { id: '2', label: '打探情报，寻找幕后黑手线索' },
        { id: '3', label: '在庭院偷懒放风，享受难得的安宁' },
      ]
    }
    if (id === 'chapter2_slums') {
      return [
        { id: '0', label: '停下来思考当前处境（不推进剧情）' },
        { id: '1', label: '追着线索深入巷子调查' },
        { id: '2', label: '先安抚被欺负的孩子并给他们一些钱' },
        { id: '3', label: '远远观察，打算改天再来' },
      ]
    }
    if (id === 'chapter2_guild') {
      return [
        { id: '0', label: '停下来思考当前处境（不推进剧情）' },
        { id: '1', label: '接下高风险护送任务，报酬丰厚' },
        { id: '2', label: '做普通打工任务，稳妥但乏味' },
        { id: '3', label: '帮女主收集与徽章相关的情报' },
      ]
    }
    if (id === 'chapter2_square') {
      return [
        { id: '0', label: '停下来思考当前处境（不推进剧情）' },
        { id: '1', label: '守在少女身边，为她挡住人群的冲撞' },
        { id: '2', label: '在人群中四处收集各方情报' },
        { id: '3', label: '远离中心，在高处观察整个局势' },
      ]
    }
    if (id === 'chapter3_court') {
      return [
        { id: '0', label: '停下来思考当前处境（不推进剧情）' },
        { id: '1', label: '在众人面前坚定站在少女一侧' },
        { id: '2', label: '试图调和各方，避免公开冲突' },
        { id: '3', label: '保持沉默，只在暗处观察局势' },
      ]
    }
    if (id === 'chapter3_balcony') {
      return [
        { id: '0', label: '停下来思考当前处境（不推进剧情）' },
        { id: '1', label: '坦白轮回的秘密与自己的软弱' },
        { id: '2', label: '只报喜不报忧，讲述轻松的冒险' },
        { id: '3', label: '什么都不说，只静静陪在她身边' },
      ]
    }
    if (id === 'chapter4_crisis') {
      return [
        { id: '0', label: '停下来思考当前处境（不推进剧情）' },
        { id: '1', label: '独自引开危机，将危险远离王都' },
        { id: '2', label: '与少女并肩作战，正面迎击核心威胁' },
        { id: '3', label: '立即撤退，只保护少数重要之人' },
      ]
    }
    if (id === 'ending') {
      return [
        { id: 'restart', label: '再次从零开始' },
      ]
    }
    return []
  }

  function handleChoice(choiceId: string) {
    if (scene === 'intro') {
      return
    }
    if (choiceId === '0') {
      setText((prev) => [
        ...prev,
        '',
        '你停下脚步，回顾一路上的行动与线索。',
        `当前状态：好感度 ${core.affection}，资产 ${core.money}G，死亡次数 ${core.deaths}。`,
      ])
      return
    }
    if (scene === 'ending' && choiceId === 'restart') {
      setLoopCount((prev) => prev + 1)
      setCore({
        name: '',
        affection: 0,
        money: 100,
        deaths: 0,
      })
      setPendingName('')
      setScene('intro')
      setText([
        '你睁开眼睛，发现自己躺在异世界王都的水边。',
        '记忆有些混乱，只记得在原来的世界平凡地活着，然后——一阵刺痛与黑暗。',
      ])
      setChoices([])
      setCheckpointCore(null)
      setCheckpointScene(null)
      return
    }
    if (choiceId === '0') {
      setText((prev) => [
        ...prev,
        '',
        '你停下脚步，回顾一路上的行动与线索。',
        `当前状态：好感度 ${core.affection}，资产 ${core.money}G，死亡次数 ${core.deaths}。`,
      ])
      return
    }
    if (scene === 'chapter1_market') {
      withCheckpoint('chapter1_market')
      const result = runMarketScene(choiceId, core)
      applySceneResult(result)
      return
    }
    if (scene === 'chapter1_inn') {
      withCheckpoint('chapter1_inn')
      const result = runInnScene(choiceId, core)
      applySceneResult(result)
      return
    }
    if (scene === 'chapter1_mansion') {
      withCheckpoint('chapter1_mansion')
      const result = runMansionScene(choiceId, core)
      applySceneResult(result)
      return
    }
    if (scene === 'chapter2_slums') {
      withCheckpoint('chapter2_slums')
      const result = runSlumsScene(choiceId, core)
      applySceneResult(result)
      return
    }
    if (scene === 'chapter2_guild') {
      withCheckpoint('chapter2_guild')
      const result = runGuildScene(choiceId, core)
      applySceneResult(result)
      return
    }
    if (scene === 'chapter2_square') {
      withCheckpoint('chapter2_square')
      const result = runSquareScene(choiceId, core)
      applySceneResult(result)
      return
    }
    if (scene === 'chapter3_court') {
      withCheckpoint('chapter3_court')
      const result = runCourtScene(choiceId, core)
      applySceneResult(result)
      return
    }
    if (scene === 'chapter3_balcony') {
      withCheckpoint('chapter3_balcony')
      const result = runBalconyScene(choiceId, core)
      applySceneResult(result)
      return
    }
    if (scene === 'chapter4_crisis') {
      withCheckpoint('chapter4_crisis')
      const result = runCrisisScene(choiceId, core)
      applySceneResult(result)
    }
  }

  const isIntro = scene === 'intro'
  const totalPages = Math.max(1, Math.ceil(text.length / PAGE_SIZE))
  const clampedPage = Math.min(page, totalPages - 1)
  const startIndex = clampedPage * PAGE_SIZE
  const visibleLines = text.slice(startIndex, startIndex + PAGE_SIZE)

  return (
    <div className="page">
      {popup && (
        <div className="popup-overlay">
          <div className="popup">{popup}</div>
        </div>
      )}
      <div className="game-shell">
        <header className="game-header">
          <div className="game-title-block">
            <h1 className="game-title">从零开始的异世界抉择</h1>
            <p className="game-subtitle">Isekai Loop Chronicle</p>
          </div>
          <div className="game-stats">
            <div className="game-stat">
              <span className="stat-label">周目</span>
              <span className="stat-value">{loopCount + 1}</span>
            </div>
            <div className="game-stat">
              <span className="stat-label">好感度</span>
              <span className="stat-value">{core.affection}</span>
            </div>
            <div className="game-stat">
              <span className="stat-label">资产</span>
              <span className="stat-value">{core.money}G</span>
            </div>
            <div className="game-stat">
              <span className="stat-label">死亡次数</span>
              <span className="stat-value">{core.deaths}</span>
            </div>
          </div>
        </header>
        <main className="game-main">
          <section className="game-story">
            <div className="story-scroll">
              {visibleLines.map((line, idx) => (
                <p key={idx} className="story-line">
                  {line}
                </p>
              ))}
            </div>
            <div className="story-pagination">
              <button
                className="page-button"
                disabled={clampedPage === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                上一页
              </button>
              <span className="page-indicator">
                {clampedPage + 1} / {totalPages}
              </span>
              <button
                className="page-button"
                disabled={clampedPage >= totalPages - 1}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              >
                下一页
              </button>
            </div>
          </section>
          <section className="game-panel">
            {isIntro ? (
              <div className="intro-panel">
                <label className="field-label">
                  主角姓名
                  <input
                    className="name-input"
                    value={pendingName}
                    onChange={(e) => setPendingName(e.target.value)}
                    placeholder="例如：菜月昴"
                  />
                </label>
                <button className="primary-button" onClick={startGame}>
                  从零开始
                </button>
              </div>
            ) : (
              <div className="choices-panel">
                {choices.map((choice) => (
                  <button
                    key={choice.id}
                    className="choice-button"
                    onClick={() => handleChoice(choice.id)}
                  >
                    {choice.label}
                  </button>
                ))}
                {choices.length === 0 && scene !== 'ending' && (
                  <p className="hint-text">故事推进中，请稍候或刷新页面重新开始。</p>
                )}
              </div>
            )}
          </section>
        </main>
        {history.length > 0 && (
          <section className="history-panel">
            <div className="history-header">最近选择</div>
            <ul className="history-list">
              {history
                .slice()
                .reverse()
                .map((entry, index) => (
                  <li key={index} className="history-item">
                    <span className="history-scene">
                      {`第${entry.loop + 1}周目 · ${sceneTitle(entry.scene)}`}
                    </span>
                    <span className="history-delta">
                      {entry.deltaAffection !== 0 && (
                        <span
                          className={
                            entry.deltaAffection > 0 ? 'delta-positive' : 'delta-negative'
                          }
                        >
                          好感 {entry.deltaAffection > 0 ? '+' : ''}
                          {entry.deltaAffection}
                        </span>
                      )}
                      {entry.deltaMoney !== 0 && (
                        <span
                          className={entry.deltaMoney > 0 ? 'delta-positive' : 'delta-negative'}
                        >
                          资产 {entry.deltaMoney > 0 ? '+' : ''}
                          {entry.deltaMoney}G
                        </span>
                      )}
                      {entry.deltaDeaths !== 0 && (
                        <span
                          className={entry.deltaDeaths > 0 ? 'delta-negative' : 'delta-positive'}
                        >
                          死亡 {entry.deltaDeaths > 0 ? '+' : ''}
                          {entry.deltaDeaths}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
            </ul>
          </section>
        )}
        <section className="achievements-panel">
          <div className="achievements-header">成就一览</div>
          <div className="achievements-grid">
            <div className={achievements.trueEnding ? 'achievement unlocked' : 'achievement'}>
              <div className="achievement-title">真结局：轮回之锁</div>
              <div className="achievement-desc">多次死亡后仍以高好感与足够资产完成旅程。</div>
            </div>
            <div className={achievements.perfectEnding ? 'achievement unlocked' : 'achievement'}>
              <div className="achievement-title">完美站位</div>
              <div className="achievement-desc">以极高好感与充裕资产守护王都与她。</div>
            </div>
            <div className={achievements.firstDeath ? 'achievement unlocked' : 'achievement'}>
              <div className="achievement-title">第一次死亡</div>
              <div className="achievement-desc">意识到自己可以从死亡中回到过去。</div>
            </div>
            <div className={achievements.manyDeaths ? 'achievement unlocked' : 'achievement'}>
              <div className="achievement-title">习惯死亡</div>
              <div className="achievement-desc">在轮回中经历了至少五次死亡。</div>
            </div>
            <div className={achievements.rich ? 'achievement unlocked' : 'achievement'}>
              <div className="achievement-title">异世界富豪</div>
              <div className="achievement-desc">在某一周目中资产达到 150G 以上。</div>
            </div>
            <div className={achievements.highAffection ? 'achievement unlocked' : 'achievement'}>
              <div className="achievement-title">心意相连</div>
              <div className="achievement-desc">与她的好感度突破了两位数。</div>
            </div>
          </div>
        </section>
        <footer className="game-footer">
          <span>基于浏览器的文字冒险体验 · 支持多次轮回与不同结局</span>
        </footer>
      </div>
    </div>
  )
}

function runMarketScene(choiceId: string, core: CoreState): SceneResult {
  if (choiceId === '1') {
    const fatal = Math.random() < 0.3
    if (fatal) {
      return {
        nextScene: 'chapter1_market',
        core,
        narrative: [
          '',
          '你冲进小巷，与小偷发生了冲突。',
          '小偷掏出匕首，你一时大意，被致命一击。视线逐渐暗下……',
        ],
        dead: true,
      }
    }
    const nextCore: CoreState = {
      ...core,
      affection: core.affection + 3,
      money: Math.max(core.money - 10, 0),
    }
    return {
      nextScene: 'chapter1_inn',
      core: nextCore,
      narrative: [
        '',
        '你冲进小巷，与小偷发生了冲突。',
        '你冒着受伤的风险夺回了徽章，自己也擦破了点皮。',
        '银发少女向你深深鞠躬表示感谢。',
        '',
        '夜幕降临，你们在同一家旅店落脚。',
        '半夜，你隐约听到走廊传来轻微的脚步声。',
      ],
      dead: false,
    }
  }
  if (choiceId === '2') {
    const nextCore: CoreState = {
      ...core,
      affection: core.affection + 2,
    }
    return {
      nextScene: 'chapter1_inn',
      core: nextCore,
      narrative: [
        '',
        '你保持距离跟在后方，悄悄观察。',
        '发现小偷只是小混混，很快被城镇守卫驱散。',
        '你帮少女分析事情经过，她对你的冷静很有好感。',
        '',
        '夜幕降临，你们在同一家旅店落脚。',
        '半夜，你隐约听到走廊传来轻微的脚步声。',
      ],
      dead: false,
    }
  }
  const nextCore: CoreState = {
    ...core,
    affection: core.affection - 1,
    money: Math.max(core.money - 5, 0),
  }
  return {
    nextScene: 'chapter1_inn',
    core: nextCore,
    narrative: [
      '',
      '你假装没看见，转身走向摊位。',
      '你买了几样小吃，心情不错，但隐约有种错过什么的感觉。',
      '',
      '夜幕降临，你在旅店独自休息。',
      '半夜，你隐约听到走廊传来轻微的脚步声。',
    ],
    dead: false,
  }
}

function runInnScene(choiceId: string, core: CoreState): SceneResult {
  if (choiceId === '1') {
    return {
      nextScene: 'chapter1_inn',
      core,
      narrative: [
        '',
        '你猛地拉开门，刚好撞见一名戴兜帽的刺客。',
        '对方比你想象中要快得多，一道寒光划过——',
      ],
      dead: true,
    }
  }
  if (choiceId === '2') {
    const nextCore: CoreState = {
      ...core,
      affection: core.affection + 3,
      money: Math.max(core.money - 10, 0),
    }
    return {
      nextScene: 'chapter1_mansion',
      core: nextCore,
      narrative: [
        '',
        '你蹲在门后，从门缝观察。',
        '看到刺客正悄悄靠近银发少女的房门。',
        '你立刻敲响她房门，并大喊有危险，惊动了整层客人。',
        '刺客被守卫制服，少女对你充满信任。',
        '',
        '数日后，你被邀请到一座贵族宅邸暂住。',
      ],
      dead: false,
    }
  }
  const nextCore: CoreState = {
    ...core,
    affection: core.affection - 2,
  }
  return {
    nextScene: 'chapter1_mansion',
    core: nextCore,
    narrative: [
      '',
      '你翻了个身，告诉自己这只是风声。',
      '第二天清晨，旅店传来不好的消息：有人在夜里遇袭。',
      '',
      '不久之后，你也被卷入贵族宅邸之中。',
    ],
    dead: false,
  }
}

function runMansionScene(choiceId: string, core: CoreState): SceneResult {
  if (choiceId === '1') {
    const nextCore: CoreState = {
      ...core,
      affection: core.affection + 3,
      money: core.money + 20,
    }
    return {
      nextScene: 'chapter2_slums',
      core: nextCore,
      narrative: [
        '',
        '你跟着女仆努力学习礼仪，在晚宴上表现得体。',
        '贵族们对你印象不错，少女也对你投来鼓励的目光。',
        '',
        '第一章完结，你隐约意识到自己已经无法回到原来的日常。',
        '',
        '第二章：王都的阴影',
        '你听说最近贫民区有人失踪，似乎和某个危险势力有关。',
      ],
      dead: false,
    }
  }
  if (choiceId === '2') {
    const fatal = Math.random() < 0.4
    if (fatal) {
      return {
        nextScene: 'chapter1_mansion',
        core,
        narrative: [
          '',
          '你四处打听，偶然听到仆人们谈论某个危险的名字。',
          '你被阴谋者发现，被引到偏僻走廊。',
          '尚未来得及反应，一阵剧痛袭来，你再次失去了意识。',
        ],
        dead: true,
      }
    }
    const nextCore: CoreState = {
      ...core,
      affection: core.affection + 4,
      money: core.money + 10,
    }
    return {
      nextScene: 'chapter2_slums',
      core: nextCore,
      narrative: [
        '',
        '你获得了关于城中势力的关键信息，并提醒了少女注意。',
        '',
        '第一章完结，你隐约意识到自己已经无法回到原来的日常。',
        '',
        '第二章：王都的阴影',
        '你听说最近贫民区有人失踪，似乎和某个危险势力有关。',
      ],
      dead: false,
    }
  }
  const nextCore: CoreState = {
    ...core,
    affection: core.affection + 1,
  }
  return {
    nextScene: 'chapter2_slums',
    core: nextCore,
    narrative: [
      '',
      '你在庭院长椅上放空，仰望星空。',
      '少女路过时看到这一幕，略带无奈地叹了口气，但还是坐在你旁边聊了一会。',
      '',
      '第一章完结，你隐约意识到自己已经无法回到原来的日常。',
      '',
      '第二章：王都的阴影',
      '你听说最近贫民区有人失踪，似乎和某个危险势力有关。',
    ],
    dead: false,
  }
}

function runSlumsScene(choiceId: string, core: CoreState): SceneResult {
  if (choiceId === '1') {
    const fatal = Math.random() < 0.4
    if (fatal) {
      return {
        nextScene: 'chapter2_slums',
        core,
        narrative: [
          '',
          '你根据模糊的线索一路追踪，来到一扇半掩的地下门前。',
          '门后有人早已埋伏，你刚推门就被重击倒地，世界再次归于黑暗。',
        ],
        dead: true,
      }
    }
    const nextCore: CoreState = {
      ...core,
      affection: core.affection + 2,
      money: Math.max(core.money - 15, 0),
    }
    return {
      nextScene: 'chapter2_guild',
      core: nextCore,
      narrative: [
        '',
        '你悄悄潜入，听到关于王都权力斗争的只言片语。',
        '虽然险些被发现，但你还是安全撤离。',
        '',
        '你决定前往旧城区的冒险者公会寻找更多线索。',
      ],
      dead: false,
    }
  }
  if (choiceId === '2') {
    const nextCore: CoreState = {
      ...core,
      affection: core.affection + 3,
      money: Math.max(core.money - 20, 0),
    }
    return {
      nextScene: 'chapter2_guild',
      core: nextCore,
      narrative: [
        '',
        '你先将受伤的孩子带到安全的地方，并为他们买了食物。',
        '孩子们向你打听那位银发小姐的情况，你意识到她在这里也被人记住了。',
        '',
        '你离开贫民区，前往旧城区的冒险者公会。',
      ],
      dead: false,
    }
  }
  const nextCore: CoreState = {
    ...core,
    affection: core.affection - 1,
  }
  return {
    nextScene: 'chapter2_guild',
    core: nextCore,
    narrative: [
      '',
      '你选择暂时观望，没有立刻介入。',
      '虽然避免了直接危险，但也错过了某些情报。',
      '',
      '你还是决定去冒险者公会打听情况。',
    ],
    dead: false,
  }
}

function runGuildScene(choiceId: string, core: CoreState): SceneResult {
  if (choiceId === '1') {
    const roll = Math.random()
    if (roll < 0.3) {
      return {
        nextScene: 'chapter2_guild',
        core,
        narrative: [
          '',
          '你带着临时队伍护送一批贵重货物前往城外。',
          '伏击来得猝不及防，你被乱箭射中，倒在尘土之中。',
        ],
        dead: true,
      }
    }
    if (roll < 0.7) {
      const nextCore: CoreState = {
        ...core,
        money: core.money + 60,
        affection: core.affection + 1,
      }
      return {
        nextScene: 'chapter2_square',
        core: nextCore,
        narrative: [
          '',
          '一路惊险不断，但最终还是成功完成了任务。',
          '你拿着报酬回到王都，发现广场上聚集了很多人。',
        ],
        dead: false,
      }
    }
    const nextCore: CoreState = {
      ...core,
      money: core.money + 80,
      affection: core.affection + 2,
    }
    return {
      nextScene: 'chapter2_square',
      core: nextCore,
      narrative: [
        '',
        '你在危急时刻做出果断判断，避免了惨重伤亡。',
        '事后，你的名字在公会的公告板上多了一行记录。',
        '等你回到王都，王城广场已经沸腾一片。',
      ],
      dead: false,
    }
  }
  if (choiceId === '2') {
    const nextCore: CoreState = {
      ...core,
      money: core.money + 30,
    }
    return {
      nextScene: 'chapter2_square',
      core: nextCore,
      narrative: [
        '',
        '你选择帮公会整理档案、搬运货物、照看仓库。',
        '虽然没有惊险刺激，但换来了稳定的报酬与短暂的安心。',
        '几天后，你受邀与少女一同前往王城广场。',
      ],
      dead: false,
    }
  }
  const nextCore: CoreState = {
    ...core,
    affection: core.affection + 4,
    money: core.money + 10,
  }
  return {
    nextScene: 'chapter2_square',
    core: nextCore,
    narrative: [
      '',
      '你花时间查阅记录、询问来往的冒险者。',
      '渐渐拼出了一个危险组织的轮廓，并将结果告诉了少女。',
      '为了确认情报，你们一同前往王城广场观察各方势力动向。',
    ],
    dead: false,
  }
}

function runSquareScene(choiceId: string, core: CoreState): SceneResult {
  let nextCore = { ...core }
  if (choiceId === '1') {
    nextCore = {
      ...core,
      affection: core.affection + 3,
    }
  } else if (choiceId === '2') {
    nextCore = {
      ...core,
      affection: core.affection + 1,
      money: core.money + 20,
    }
  } else {
    nextCore = {
      ...core,
      affection: core.affection + 1,
    }
  }
  const lines: string[] = []
  lines.push('')
  lines.push('数日后，王城的空气愈发紧绷。')
  lines.push('关于王选的传闻在街巷间流传，每个人都在等待宣告命运的那一天。')
  lines.push('')
  lines.push('第三章：王选会场')
  lines.push('在高耸的王城大厅中，你与银发少女一同站在众人目光的焦点之下。')
  return {
    nextScene: 'chapter3_court',
    core: nextCore,
    narrative: lines,
    dead: false,
  }
}

function runCourtScene(choiceId: string, core: CoreState): SceneResult {
  if (choiceId === '1') {
    const roll = Math.random()
    if (roll < 0.25) {
      return {
        nextScene: 'chapter3_court',
        core,
        narrative: [
          '',
          '你在众人面前大声表明立场，公开支持少女。',
          '某股势力对你心生杀意，趁混乱之际向你发动袭击。',
          '你只来得及看见少女伸出手，便再次陷入无尽黑暗。',
        ],
        dead: true,
      }
    }
    const nextCore: CoreState = {
      ...core,
      affection: core.affection + 3,
    }
    return {
      nextScene: 'chapter3_balcony',
      core: nextCore,
      narrative: [
        '',
        '你在众人面前坚定地站在少女一侧，毫不退缩。',
        '大厅一阵骚动，但你从她的眼神中看到了坚定与感激。',
        '',
        '夜色降临，你们在王城的高台上短暂独处。',
      ],
      dead: false,
    }
  }
  if (choiceId === '2') {
    const nextCore: CoreState = {
      ...core,
      affection: core.affection + 1,
      money: core.money + 20,
    }
    return {
      nextScene: 'chapter3_balcony',
      core: nextCore,
      narrative: [
        '',
        '你尽力调和各方言辞，让会议至少在表面上顺利进行。',
        '少女对你的圆滑有些无奈，却也明白你是在保护她。',
        '',
        '会议结束后，你被短暂留在高台，与她一起眺望王都灯火。',
      ],
      dead: false,
    }
  }
  const nextCore: CoreState = {
    ...core,
    affection: core.affection - 1,
  }
  return {
    nextScene: 'chapter3_balcony',
    core: nextCore,
    narrative: [
      '',
      '你选择沉默，只在角落中安静观察局势的变化。',
      '少女没有责怪你，但你从她的目光中读到一丝距离感。',
      '',
      '王选会议结束后，你们在深夜的王城高台上短暂相遇。',
    ],
    dead: false,
  }
}

function runBalconyScene(choiceId: string, core: CoreState): SceneResult {
  let nextCore = { ...core }
  const lines: string[] = []
  lines.push('')
  lines.push('王城高台的夜风有些凉，你们俯瞰着灯火斑驳的王都。')
  if (choiceId === '1') {
    nextCore = {
      ...core,
      affection: core.affection + 3,
    }
    lines.push('你深吸一口气，把关于轮回与死亡的一切全部告诉了她。')
    lines.push('你坦白自己的恐惧与软弱，也坦白每一次选择背后的犹豫。')
    lines.push('少女沉默了很久，最终伸出手握住了你冰冷的指尖。')
  } else if (choiceId === '2') {
    nextCore = {
      ...core,
      affection: core.affection + 1,
    }
    lines.push('你只挑轻松的片段讲给她听，略过了所有血与痛的部分。')
    lines.push('她听得入神，却隐约感觉到你有所隐瞒。')
    lines.push('夜风吹乱她的银发，你忍不住想要把更多真相告诉她。')
  } else {
    lines.push('你什么也没说，只是站在她身旁，一起望向遥远的星空。')
    lines.push('不需要言语，只有心跳与风声在耳畔交织。')
    nextCore = {
      ...core,
      affection: core.affection + 2,
    }
  }
  return {
    nextScene: 'chapter4_crisis',
    core: nextCore,
    narrative: [
      ...lines,
      '',
      '然而，就在夜风渐渐平静之时，你隐约感觉到远方传来不祥的震动。',
      '有关危险组织与王都防御的碎片情报，在你脑中快速拼接成了更大的图景。',
      '第四章：崩坏边界',
      '一道巨响划破夜空，远处的城区亮起了诡异的红光。',
      '你必须在下一刻做出抉择——这一次，将不只是少数人的命运。',
    ],
    dead: false,
  }
}

function runCrisisScene(choiceId: string, core: CoreState): SceneResult {
  if (choiceId === '1') {
    const roll = Math.random()
    if (roll < 0.35) {
      return {
        nextScene: 'chapter4_crisis',
        core,
        narrative: [
          '',
          '你选择独自引开危机，奔向敌人力量最集中的方向。',
          '在爆炸与咒语交织的废墟中，你拖着伤痕累累的身体继续前进。',
          '最终，一道刺目的白光吞没了你的视野——',
        ],
        dead: true,
      }
    }
    const nextCore: CoreState = {
      ...core,
      affection: core.affection + 2,
      money: Math.max(core.money - 40, 0),
    }
    const endingLines = buildEnding(nextCore)
    return {
      nextScene: 'ending',
      core: nextCore,
      narrative: [
        '',
        '你独自引开了绝大部分攻击，将危险远远带离王都与宅邸。',
        '当你精疲力竭地倒在地上时，看见远处的灯火依旧完整地闪烁着。',
        '少女跑到你身边，泪水与笑容一同落下。',
        ...endingLines,
      ],
      dead: false,
    }
  }
  if (choiceId === '2') {
    const nextCore: CoreState = {
      ...core,
      affection: core.affection + 3,
      money: Math.max(core.money - 20, 0),
    }
    const endingLines = buildEnding(nextCore)
    return {
      nextScene: 'ending',
      core: nextCore,
      narrative: [
        '',
        '你没有选择分开，而是与少女并肩，正面面对袭来的力量。',
        '在濒临崩溃的防线前，你们轮流支撑起彼此摇摇欲坠的身影。',
        '当最后一道光芒散去时，你们依然站在同一条线上，身后是尚且完好的王都。',
        ...endingLines,
      ],
      dead: false,
    }
  }
  const nextCore: CoreState = {
    ...core,
    affection: core.affection - 2,
  }
  const endingLines = buildEnding(nextCore)
  return {
    nextScene: 'ending',
    core: nextCore,
    narrative: [
      '',
      '你迅速计算失控后可能造成的伤亡，做出了最现实也最残酷的选择。',
      '你带着少数重要之人撤离，留下沉默的王都与未来难以抹去的阴影。',
      '少女没有责怪你，只是看着你时，目光里多了一层遥远的雾。',
      ...endingLines,
    ],
    dead: false,
  }
}

function buildEnding(core: CoreState): string[] {
  const lines: string[] = []
  lines.push('')
  lines.push('数个章节的喧嚣渐渐远去，夜色笼罩了王都。')
  lines.push('你在难得安静的夜里，回想这一段段轮回中的抉择。')
  lines.push('')
  lines.push(`当前状态：好感度 ${core.affection}，资产 ${core.money}G，死亡次数 ${core.deaths}。`)
  lines.push('')
  lines.push('【结局】')
  if (core.deaths >= 3 && core.affection >= 8 && core.money >= 60) {
    lines.push('你已经无数次在死亡与轮回之间往返，记住了每一道伤痕与笑容。')
    lines.push('当你坦然面对自己的软弱与贪念时，轮回之锁终于悄然松动。')
    lines.push('少女握着你的手，目光坚定而温柔。')
    lines.push('“不管发生多少次，我都会在下一个清晨再次遇见你。”')
    lines.push('在这个世界，你们终于不再只是命运的棋子，而是共同书写结局的人。')
  } else if (core.affection >= 8 && core.money >= 80) {
    lines.push('你不仅守护了少女，也赢得了在这个世界安身立命的资本。')
    lines.push('在一次次轮回与选择中，你们彼此成为对方最坚实的依靠。')
  } else if (core.affection >= 5) {
    lines.push('你在关键时刻做出了正确的选择。')
    lines.push('尽管前路仍然危险，但至少此刻，你们并肩而立。')
  } else if (core.affection <= 0) {
    lines.push('你错过了太多机会，少女对你保持礼貌的距离。')
    lines.push('你明白，若想改变这一切，或许还需要再一次“从零开始”。')
  } else {
    lines.push('你勉强在这个世界立足，却始终觉得哪里不够完美。')
    lines.push('关于她的笑容，你还想再看到更多次。')
  }
  lines.push('')
  lines.push('如果你愿意，下一次轮回已经在远方静静等待。')
  return lines
}

export default App
