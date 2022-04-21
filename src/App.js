import logo from './bg.svg'
import { useState } from 'react'
import './App.css'

const HIGH_THREADS_NUM = 6;
const LOW_THREADS_NUM = 4;
const HIGH_THREADS_RESERVED_NUM = 1;
const LOW_THREADS_RESERVED_NUM = 2;

const HIGH_WAIT_QUEUE = 'HIGH_WAIT_QUEUE'
const HIGH_ONGOING_QUEUE = 'HIGH_ONGOING_QUEUE'
const LOW_WAIT_QUEUE = 'LOW_WAIT_QUEUE'
const LOW_ONGOING_QUEUE = 'LOW_ONGOING_QUEUE'

let GID = 0;

const QUEUE_POSITION_MAP = {
  HIGH_WAIT_QUEUE: {
    left: 0,
    top: 0,
    numPreLine: 7,
  },
  HIGH_ONGOING_QUEUE: {
    left: 634,
    top: 0,
    numPreLine: 5,
  },
  LOW_WAIT_QUEUE: {
    left: 0,
    top: 228,
    numPreLine: 7,
  },
  LOW_ONGOING_QUEUE: {
    left: 634,
    top: 228,
    numPreLine: 5,
  },
}

const highWaitQueue = []
const highOngoingQueue = []
const lowWaitQueue = []
const lowOngoingQueue = []


function refreshPositionList() {
  function getPosition(type, index) {
    return {
      left: (index % QUEUE_POSITION_MAP[type].numPreLine) * 68 + QUEUE_POSITION_MAP[type].left,
      top: Math.floor(index / QUEUE_POSITION_MAP[type].numPreLine) * 22 + QUEUE_POSITION_MAP[type].top,
    }
  }
  const positionList = [
    ...highWaitQueue.map((item, index) => ({...item, ...getPosition(HIGH_WAIT_QUEUE, index)})),
    ...highOngoingQueue.map((item, index) => ({...item, ...getPosition(HIGH_ONGOING_QUEUE, index)})),
    ...lowWaitQueue.map((item, index) => ({...item, ...getPosition(LOW_WAIT_QUEUE, index)})),
    ...lowOngoingQueue.map((item, index) => ({...item, ...getPosition(LOW_ONGOING_QUEUE, index)})),
  ]
  return positionList
}

function getGid() {
  GID++;
  return GID.toString(16).padStart(4, '0')
}

function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomNumber(min, max) {
    return (Math.random() * (max - min) + min).toFixed(2);
}

function App() {
  const [data, setData] = useState([])

  // const generateTransHandle = (from, to) => () => {
  //   const indexMap = data.typeCount
  //   const list = data.list.filter(i => i.queueFrom === from)
  //   list.sort((a, b) => a.renderIndex - b.renderIndex)
  //   for (let i = 0; i < list.length; i++) {
  //     if (list[i].queueFrom === from) {
  //       const queueIndex = queue.findIndex(item => item.id === list[i].id)
  //       queue[queueIndex].queueFrom = to
  //       queue[queueIndex].nextRenderIndex = indexMap[to]
  //       queue[queueIndex].renderOffset = 0
  //       setData(generatePosition(from))
  //       return
  //     }
  //   }
  // }

  const OneTurnChatHandle = () => {
    function calc_high_threads_occupied_num(high_threads_num, high_threads_reserved_num, high_ongoing_num) {
        let high_threads_occupied_num = 0;
        if (high_ongoing_num > high_threads_num) {
            high_threads_occupied_num = high_ongoing_num
        } else if (high_ongoing_num + high_threads_reserved_num >= high_threads_num) {
            high_threads_occupied_num = high_threads_num
        } else {
            high_threads_occupied_num = high_threads_reserved_num + high_ongoing_num
        }
        return high_threads_occupied_num
    }
    function restore_item() {
        console.log("high_ongoing_queue", JSON.stringify(highOngoingQueue))
        console.log("low_ongoing_queue", JSON.stringify(lowOngoingQueue))
        
    }

    if (highWaitQueue.length > 0 && highOngoingQueue.length < HIGH_THREADS_NUM + LOW_THREADS_NUM - Math.max(LOW_THREADS_RESERVED_NUM, highOngoingQueue.length)) {
        let item = highWaitQueue.pop();
        item['latency'] = randomNumber(2, 10)
        highOngoingQueue.push(item);
        // refresh_display();
    } else if(lowWaitQueue.length > 0 && lowOngoingQueue.length < HIGH_THREADS_NUM + LOW_THREADS_NUM - calc_high_threads_occupied_num(HIGH_THREADS_NUM, HIGH_THREADS_RESERVED_NUM, highOngoingQueue.length)) {
        let item = lowWaitQueue.pop();
        item['latency'] = randomNumber(2, 10)
        lowOngoingQueue.push(item);
        // refresh_display();
    } else {
        restore_item()
    }
    setData(refreshPositionList())
}

  const newOneHandle = (queue) => {
    queue.push({
      id: getGid(),
      turns: randomInt(2, 9),
    })
    setData(refreshPositionList())
  }

  return (
    <div className='app'>
      <img className='app-bg' src={logo} alt='' />
      <div className='container'>
        {data
        .sort((a, b) => a.id.localeCompare(b.id))
        .map((item) => {
          // const { left, top } = QUEUE_POSITION_MAP[item.queueFrom]
          return (
            <div
              className='item'
              key={item.id}
              style={{
                left: item.left,
                top: item.top,
              }}
            >
              {item.id} ({item.turns})
            </div>
          )
        })}
      </div>
      <div>
        New: 
        <button onClick={() => newOneHandle(highWaitQueue)}>HighWaitQueue Enqueue</button>
        <button onClick={() => newOneHandle(lowWaitQueue)}>LowWaitQueue Enqueue</button>
        <button onClick={() => OneTurnChatHandle()}>One Turn Chat Step</button>
      </div>
    </div>
  )
}

export default App
