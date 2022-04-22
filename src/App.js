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
    leftUnit: 68,
    topUnit: 22,
  },
  HIGH_ONGOING_QUEUE: {
    left: 634,
    top: 0,
    numPreLine: 7,
    leftUnit: 68,
    topUnit: 44,
  },
  LOW_WAIT_QUEUE: {
    left: 0,
    top: 228,
    numPreLine: 7,
    leftUnit: 68,
    topUnit: 22,
  },
  LOW_ONGOING_QUEUE: {
    left: 634,
    top: 228,
    numPreLine: 7,
    leftUnit: 68,
    topUnit: 44,
  },
}

const highWaitQueue = []
let highOngoingQueue = []
const lowWaitQueue = []
let lowOngoingQueue = []


function refreshPositionList() {
  function getPosition(type, index) {
    return {
      left: (index % QUEUE_POSITION_MAP[type].numPreLine) * QUEUE_POSITION_MAP[type].leftUnit + QUEUE_POSITION_MAP[type].left,
      top: Math.floor(index / QUEUE_POSITION_MAP[type].numPreLine) * QUEUE_POSITION_MAP[type].topUnit + QUEUE_POSITION_MAP[type].top,
    }
  }
  const positionList = [
    ...highWaitQueue.map((item, index) => ({type: 'wait', ...item, ...getPosition(HIGH_WAIT_QUEUE, index)})),
    ...highOngoingQueue.map((item, index) => ({type: 'ongoing', ...item, ...getPosition(HIGH_ONGOING_QUEUE, index)})),
    ...lowWaitQueue.map((item, index) => ({type: 'wait', ...item, ...getPosition(LOW_WAIT_QUEUE, index)})),
    ...lowOngoingQueue.map((item, index) => ({type: 'ongoing', ...item, ...getPosition(LOW_ONGOING_QUEUE, index)})),
  ]
  let minLatencyOfHigh = highOngoingQueue.length > 0 ? Math.min(...highOngoingQueue.map(item => item.latency)) : -1
  let minLatencyOfLow = lowOngoingQueue.length > 0 ? Math.min(...lowOngoingQueue.map(item => item.latency)) : -1
  return { positionList, minLantency: minLatencyOfHigh > minLatencyOfLow ? minLatencyOfLow : minLatencyOfHigh}
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
    return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

function sub(a, b) {
  return parseFloat((a - b).toFixed(2))
}

function App() {
  const [data, setData] = useState({positionList: [], minLantency: 0})


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
        let minLatencyOfHigh = Math.min(...highOngoingQueue.map(item => item.latency))
        let minLatencyOfLow = Math.min(...lowOngoingQueue.map(item => item.latency))
        if (minLatencyOfHigh > minLatencyOfLow) {
          let lowIndex = lowOngoingQueue.findIndex((item) => item.latency === minLatencyOfLow)
          let deleted = lowOngoingQueue.splice(lowIndex, 1)[0]
          lowOngoingQueue = lowOngoingQueue.map(item => ({...item, latency: sub(item.latency ,minLatencyOfLow)}))
          highOngoingQueue = highOngoingQueue.map(item => ({...item, latency: sub(item.latency ,minLatencyOfLow)}))
          if (deleted.turns > 1) {
            lowWaitQueue.push({id: deleted.id, turns: deleted.turns - 1})
          }
        } else {
          let highIndex = highOngoingQueue.findIndex((item) => item.latency === minLatencyOfHigh)
          let deleted = highOngoingQueue.splice(highIndex, 1)[0]
          if (deleted.turns > 1) {
            highWaitQueue.push({id: deleted.id, turns: deleted.turns - 1})
          }
          lowOngoingQueue = lowOngoingQueue.map(item => ({...item, latency: sub(item.latency, minLatencyOfHigh)}))
          highOngoingQueue = highOngoingQueue.map(item => ({...item, latency: sub(item.latency ,minLatencyOfHigh)}))
        }
    }

    if (highWaitQueue.length > 0 && highOngoingQueue.length < HIGH_THREADS_NUM + LOW_THREADS_NUM - Math.max(LOW_THREADS_RESERVED_NUM, lowOngoingQueue.length)) {
        let item = highWaitQueue.shift();
        item['latency'] = randomNumber(2, 10)
        highOngoingQueue.push(item);
    } else if(lowWaitQueue.length > 0 && lowOngoingQueue.length < HIGH_THREADS_NUM + LOW_THREADS_NUM - calc_high_threads_occupied_num(HIGH_THREADS_NUM, HIGH_THREADS_RESERVED_NUM, highOngoingQueue.length)) {
        let item = lowWaitQueue.shift();
        item['latency'] = randomNumber(2, 10)
        lowOngoingQueue.push(item);
    } else {
        restore_item()
    }
    setData(refreshPositionList())
}

  const newOneHandle = (queue) => {
    queue.unshift({
      id: getGid(),
      turns: randomInt(2, 9),
    })
    setData(refreshPositionList())
  }


  // console.log('data', data)
  return (
    <div className='app'>
      <img className='app-bg' src={logo} alt='' />
      <div className='container'>
        {data.positionList
        .sort((a, b) => a.id.localeCompare(b.id))
        .map((item) => {
          let className = item.type === 'wait' ? 'item-wait' : 'item-ongoing'
          return (
            <div
              className={className}
              key={item.id}
              style={{
                left: item.left,
                top: item.top,
              }}
            >
              {item.id} ({item.turns})<span className={item.latency === data.minLantency ? 'latency-min' : 'latency'}>{item.type === 'wait' ? '' : '[' + item.latency + ']'}</span>
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
      <h2 id="high-wait-queue">High Wait Queue</h2>
      <h2 id="high-ongoing-queue">High Ongoing Queue</h2>
      <h2 id="low-wait-queue">Low Wait Queue</h2>
      <h2 id="low-ongoing-queue">Low Ongoing Queue</h2>
      <div>
        <h2>HIGH_THREADS_NUM: {HIGH_THREADS_NUM}</h2>
        <h2>LOW_THREADS_NUM: {LOW_THREADS_NUM}</h2>
        <h2>HIGH_THREADS_RESERVED_NUM: {HIGH_THREADS_RESERVED_NUM}</h2>
        <h2>LOW_THREADS_RESERVED_NUM: {LOW_THREADS_RESERVED_NUM}</h2>
      </div>
    </div>
  )
}

export default App
