import React, { useEffect, useState } from 'react'
import styled from '@emotion/styled'
import { CalendarVirtualView } from './CalendarVirtualView'

const weeks = "一二三四五六日".split("")


interface CModel {
  year: number
  month: number
  day: number
  hour: number
  minutes: number
  seconds: number
}

function readFromDate(date: Date): CModel {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hour: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds()
  }
}


function fillTwo(i: number) {
  const v = i + ""
  if (v.length < 2) {
    return "0" + v
  }
  return v
}
function writeToDate(selectedDateTime: CModel): Date {
  let d = new Date()
  d.setFullYear(selectedDateTime.year)
  d.setMonth(selectedDateTime.month - 1)
  d.setDate(selectedDateTime.day)
  d.setHours(selectedDateTime.hour)
  d.setMinutes(selectedDateTime.minutes)
  d.setSeconds(selectedDateTime.seconds)
  return d
}

export default function CalendarView({
  date, setDate
}: {
  date: Date,
  setDate(v: Date): void
}) {
  const [calendar, setCalendar] = useState(() => new CalendarVirtualView(date.getFullYear(), date.getMonth() + 1, 1))
  const [selectedDateTime, setSelectedDateTime] = useState(() => {
    return readFromDate(date)
  })
  useEffect(() => {
    setSelectedDateTime(readFromDate(date))
    setCalendar(new CalendarVirtualView(date.getFullYear(), date.getMonth() + 1, 1))
  }, [date])

  return (
    <DateTimeWrapper>
      {/* <button onClick={() => {
        setCalendar(new CalendarVirtualView(calendar.year, calendar.month, calendar.firstWeek - 1))
      }}>首页位置</button> */}
      <div className='calendar'>

        <div className='year-month-picker'>
          <button onClick={() => {
            setCalendar(calendar.getLastYear())
          }}>{"<<"}</button>
          <button onClick={() => {
            setCalendar(calendar.lastMonth())
          }}>{"<"}</button>
          <div>{calendar.year}</div>
          <div>{calendar.month}</div>
          <button onClick={() => {
            setCalendar(calendar.nextMonth())
          }}>{">"}</button>
          <button onClick={() => {
            setCalendar(calendar.getNextYear())
          }}>{">>"}</button>
        </div>
        <div className='week'>
          {Array(7).fill("").map((_, i) => {
            return <div key={i}>{weeks[calendar.weekDay(i)]}</div>
          })}
        </div>
        <div className='day'>

          {Array(6).fill("").map((_, y) => {
            return <div className='row'>
              {Array(7).fill("").map((_, x) => {
                const o = calendar.fullDayOf(x, y)

                let onClick: () => void = () => { }
                let className = ''
                if (o.type == "last") {
                  className = 'last'
                  onClick = () => {
                    const lastMonth = calendar.lastMonth()
                    setCalendar(lastMonth)
                    setSelectedDateTime({
                      ...selectedDateTime,
                      year: lastMonth.year,
                      month: lastMonth.month,
                      day: o.day
                    })
                  }
                } else if (o.type == "next") {
                  className = 'next'
                  onClick = () => {
                    const nextMonth = calendar.nextMonth()
                    setCalendar(nextMonth)
                    setSelectedDateTime({
                      ...selectedDateTime,
                      year: nextMonth.year,
                      month: nextMonth.month,
                      day: o.day
                    })
                  }
                } else {
                  onClick = () => {
                    setSelectedDateTime({
                      ...selectedDateTime,
                      year: calendar.year,
                      month: calendar.month,
                      day: o.day
                    })
                  }
                }

                const isSelected = (calendar.year == selectedDateTime.year && calendar.month == selectedDateTime.month && o.day == selectedDateTime.day && o.type == "this")
                  || (calendar.lastMonth().year == selectedDateTime.year && calendar.lastMonth().month == selectedDateTime.month && o.day == selectedDateTime.day && o.type == "last")
                  || (calendar.nextMonth().year == selectedDateTime.year && calendar.nextMonth().month == selectedDateTime.month && o.day == selectedDateTime.day && o.type == "next")

                return <div className={`cell ${className} ${isSelected ? 'selected' : ''}`} onClick={onClick}>{o.day}</div>
              })}
            </div>
          })}
        </div>
      </div>
      <div className='time-picker'>
        <select
          value={selectedDateTime.hour}
          onChange={e => {
            const value = e.target.value
            setSelectedDateTime({
              ...selectedDateTime,
              hour: Number(value)
            })
          }}>
          {Array(24).fill("").map((v, i) => {
            return <option key={i} value={i}>{fillTwo(i)}</option>
          })}
        </select>
        <select
          value={selectedDateTime.minutes}
          onChange={e => {
            const value = e.target.value
            setSelectedDateTime({
              ...selectedDateTime,
              minutes: Number(value)
            })
          }}>
          {Array(60).fill("").map((v, i) => {
            return <option key={i} value={i + 1}>{fillTwo(i + 1)}</option>
          })}
        </select>
        <select
          value={selectedDateTime.seconds}
          onChange={e => {
            const value = e.target.value
            setSelectedDateTime({
              ...selectedDateTime,
              seconds: Number(value)
            })
          }}>
          {Array(60).fill("").map((v, i) => {
            return <option key={i} value={i + 1}>{fillTwo(i + 1)}</option>
          })}
        </select>
      </div>
      <button className='ok-button' onClick={() => {
        setDate(writeToDate(selectedDateTime))
      }}>OK</button>
    </DateTimeWrapper>
  )
}

/** rem计算函数 */
export function rem(px: number) {
  return remScale(px) + "rem";
}

function remScale(px: number) {
  return px / 16;
}

const DateTimeWrapper = styled.div`
.calendar{
  display:flex;
  flex-direction:column;
  align-items:stretch;
  text-align:center;

  .year-month-picker{
    display:flex;
    > * {
      height:${rem(48)};
      flex:1;
      display:flex;
      align-items:center;
      justify-content:center;
    }
  }
  .week{
    display:flex;
    > * {
      height:${rem(48)};
      flex:1;
      display:flex;
      align-items:center;
      justify-content:center;
    }
  }
  .day{
    display:flex;
    flex-direction:column;
    .row{
      flex:1;
      display:flex;

      .cell{
        height:${rem(48)};
        flex:1;
        display:flex;
        align-items:center;
        justify-content:center;

        &.last,&.next{
          color:gray;
        }
        &.selected{
          background:green;
        }
      }
    }
  }
}

.time-picker{
  display:flex;
  justify-content:center;
  > * {
  font-size:${rem(16)};
  }
  margin-bottom:${rem(14)};
}
.ok-button{
  margin:0 auto;
  width: ${rem(272)};
  height: ${rem(56)};

  background: #D9ED81;
  border-radius: ${rem(28)};
}
`