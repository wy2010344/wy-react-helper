
/**
 * 获得这个月份的总天数
 * @param year 
 * @param month 
 * @returns 
 */
function getDays(year: number, month: number) {
  if ((month == 1) || (month == 3) || (month == 5) || (month == 7) || (month == 8) || (month == 10) || (month == 12)) {
    return 31
  }
  if ((month == 4) || (month == 6) || (month == 9) || (month == 11)) {
    return 30
  }
  if ((year % 4 == 1) || (year % 4 == 2) || (year % 4 == 3)) {
    return 28
  }
  if (year % 400 == 0) {
    return 29
  }
  if (year % 100 == 0) {
    return 28
  }
  return 29;
}

export class CalendarVirtualView {
  constructor(
    public readonly year: number,
    public readonly month: number,
    firstWeek: number
  ) {
    let i = firstWeek % 7
    if (i == 0) {
      i = 7
    }
    this.firstWeek = i
    this.days = getDays(this.year, this.month)


    const date = new Date()
    date.setDate(1)
    date.setFullYear(year)
    date.setMonth(month - 1)
    this.firstDay = date.getDay()
  }
  /**
   * 这个月的第一天是星期几
   */
  public readonly firstDay: number
  /**
   * 这个月有多少天
   * @returns 
   */
  public readonly days: number
  /**第一列是星期几(1-7) */
  public readonly firstWeek: number

  getLastYear(month?: number, firstWeek?: number) {
    return new CalendarVirtualView(this.year - 1, month || this.month, firstWeek || this.firstWeek)
  }
  getNextYear(month?: number, firstWeek?: number) {
    return new CalendarVirtualView(this.year + 1, month || this.month, firstWeek || this.firstWeek)
  }

  /**
   * 上一个月
   * @param firstWeek 
   * @returns 
   */
  getlastMonth(firstWeek?: number) {
    let m = this.month - 1
    let y = this.year
    if (m < 1) {
      m = 12
      y = y - 1
    }
    return new CalendarVirtualView(y, m, firstWeek || this.firstWeek)
  }

  private _lastMonth: CalendarVirtualView | undefined = undefined

  lastMonth() {
    if (!this._lastMonth) {
      this._lastMonth = this.getlastMonth()
    }
    return this._lastMonth
  }

  getNextMonth(firstWeek?: number) {
    let m = this.month + 1
    let y = this.year
    if (m > 12) {
      m = 1
      y = y + 1
    }
    return new CalendarVirtualView(y, m, firstWeek || this.firstWeek)
  }

  private _nextMonth: CalendarVirtualView | undefined = undefined
  nextMonth() {
    if (!this._nextMonth) {
      this._nextMonth = this.getNextMonth()
    }
    return this._nextMonth
  }
  /**
   * 星期的列表，如"一二三四五六日".split("")
   * 下标映射下标
   * @param i 下标，0-6
   * @returns 映射下标
   */
  weekDay(i: number) {
    return (i + this.firstWeek - 1) % 7
  }

  /**
   * 一般是6行7列
   * @param x 行
   * @param y 列
   * @returns 
   */
  dayOf(x: number, y: number) {
    let diff = this.firstDay - this.firstWeek
    if (diff < 0) {
      diff = diff + 7
    }
    return x + y * 7 + 1 - diff
  }


  /**
   * 上月与下月显示空
   * @param x 行
   * @param y 列
   */
  lessDayOf(x: number, y: number) {
    const d = this.dayOf(x, y)
    if (d < 1) {
      return ""
    } else if (d > this.days) {
      return ""
    } else {
      return d
    }
  }

  fullDayOf(x: number, y: number): {
    type: "last" | "this" | "next",
    day: number
  } {
    const d = this.dayOf(x, y)
    if (d < 1) {
      return {
        type: "last",
        day: this.lastMonth().days + d
      }
    } else if (d > this.days) {
      //y==4,1,y==5,2
      return {
        type: "next",
        day: d - this.days
      }
    } else {
      return {
        type: "this",
        day: d
      }
    }
  }
}

