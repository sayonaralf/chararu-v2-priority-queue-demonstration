import logo from './bg.svg'
import { useState } from 'react'
import './App.css'

const HighLeft = 'highLeft'
const HighRight = 'highRight'
const LowLeft = 'lowLeft'
const LowRight = 'lowRight'
const queueType = [HighLeft, HighRight, LowLeft, LowRight]
const getRandomQueueType = () => queueType[Math.floor(Math.random() * 4)]

const INIT_NUM = 30
let curId = INIT_NUM
const queue = Array(INIT_NUM)
  .fill(0)
  .map((_, i) => {
    return {
      id: i,
      queueFrom: getRandomQueueType(),
    }
  })
let typeCount = {
  highLeft: 0,
  highRight: 0,
  lowLeft: 0,
  lowRight: 0,
}
const NUM_PER_LINE = 9
const generatePosition = (from) => {
  typeCount = {
    highLeft: 0,
    highRight: 0,
    lowLeft: 0,
    lowRight: 0,
  }
  const waitToAdd = {
    highLeft: 0,
    highRight: 0,
    lowLeft: 0,
    lowRight: 0,
  }
  const list = queue.map((item) => {
    let renderIndex
    if (item.nextRenderIndex) {
      if(typeof item.renderOffset === 'number' && item.queueFrom === from) {
        item.renderOffset += 1
      }
      renderIndex = item.nextRenderIndex - (item.renderOffset || 0)
      waitToAdd[item.queueFrom] += 1
    } else {
      renderIndex = typeCount[item.queueFrom]
      typeCount[item.queueFrom] += 1
    }
    const left = (renderIndex % NUM_PER_LINE) * 50
    const topOffset = Math.floor(renderIndex / NUM_PER_LINE) * 32
    const res = {
      ...item,
      renderIndex,
      left,
      top: topOffset,
    }
    return res
  })
  Object.entries(waitToAdd).forEach(([key, value]) => {
    typeCount[key] += value
  })
  return {
    list,
    typeCount,
  }
}
const queuePositionMap = {
  highLeft: {
    left: 0,
    top: 0,
  },
  highRight: {
    left: 634,
    top: 0,
  },
  lowLeft: {
    left: 0,
    top: 228,
  },
  lowRight: {
    left: 634,
    top: 228,
  },
}

const initData = generatePosition()
function App() {
  const [data, setData] = useState(initData)

  const generateTransHandle = (from, to) => () => {
    const indexMap = data.typeCount
    const list = data.list.filter(i => i.queueFrom === from)
    list.sort((a, b) => a.renderIndex - b.renderIndex)
    for (let i = 0; i < list.length; i++) {
      if (list[i].queueFrom === from) {
        const queueIndex = queue.findIndex(item => item.id === list[i].id)
        queue[queueIndex].queueFrom = to
        queue[queueIndex].nextRenderIndex = indexMap[to]
        queue[queueIndex].renderOffset = 0
        setData(generatePosition(from))
        return
      }
    }
  }

  const newOneHandle = (type) => {
    queue.push({
      id: curId++,
      queueFrom:type,
      nextRenderIndex: typeCount[type],
      renderOffset: 0,
    })
    setData(generatePosition())
  }

  return (
    <div className='app'>
      <img className='app-bg' src={logo} alt='' />
      <div className='container'>
        {data.list.map((item, index) => {
          const { left, top } = queuePositionMap[item.queueFrom]
          return (
            <div
              className='item'
              key={index}
              style={{
                left: item.left + left,
                top: item.top + top,
              }}
            >
              {index}
            </div>
          )
        })}
      </div>
      <div>
        New: 
        <button onClick={() => newOneHandle(HighLeft)}>HighLeft</button>
        <button onClick={() => newOneHandle(HighRight)}>HighRight</button>
        <button onClick={() => newOneHandle(LowLeft)}>LowLeft</button>
        <button onClick={() => newOneHandle(LowRight)}>LowRight</button>
        <br/>
        <button onClick={generateTransHandle(HighLeft, HighRight)}>high 👉🏻</button>
        <button onClick={generateTransHandle(HighRight, HighLeft)}>high 👈🏻</button>
        <button onClick={generateTransHandle( LowLeft, LowRight)}>low 👉🏻</button>
        <button onClick={generateTransHandle(LowRight, LowLeft)}>high 👈🏻</button>

        <br/>
        <button onClick={generateTransHandle(LowRight, HighLeft)}>↖</button>
        <button onClick={generateTransHandle(LowLeft, HighRight)}>↗</button>
        <button onClick={generateTransHandle(HighRight, LowLeft)}>↙</button>
        <button onClick={generateTransHandle(HighLeft, LowRight)}>↘</button>
      </div>
    </div>
  )
}

export default App
