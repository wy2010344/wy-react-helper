import React, { useEffect, useMemo, useReducer, useRef } from "react"
import { flushSync } from "react-dom"
import { contentEditableText, EditRecord, ContentEditableModel, fixScroll, appendRecord } from "wy-dom-helper/contentEditable"
import { emptyArray } from "wy-helper"
import { HookRender } from "wy-react-helper"

export type EditAction = {
  type: "input"
  record: EditRecord
} | {
  type: "undo"
} | {
  type: "redo"
} | {
  type: "reset"
  record: EditRecord
}


function reducer(model: ContentEditableModel, action: EditAction): ContentEditableModel {
  if (action.type == "input") {
    return appendRecord(model, action.record)
  } else if (action.type == "undo") {
    const cdx = model.currentIndex
    if (cdx) {
      return {
        currentIndex: cdx - 1,
        history: model.history
      }
    }
  } else if (action.type == "redo") {
    const ndx = model.currentIndex + 1
    if (ndx < model.history.length) {
      return {
        currentIndex: ndx,
        history: model.history
      }
    }
  } else if (action.type == "reset") {
    return {
      currentIndex: 0,
      history: [action.record],
    };
  }
  return model
}

export function useContentEditable<T>(t: T, initFun: (t: T) => ContentEditableModel) {
  const [value, _dispatch] = useReducer(reducer, t, initFun)
  const dispatch: typeof _dispatch = function (...args) {
    flushSync(() => {
      _dispatch(...args)
    })
  }
  const current = useMemo(() => {
    return value.history[value.currentIndex]
  }, [value.history, value.currentIndex])
  return {
    current,
    value,
    dispatch,
    renderContentEditable(args: {
      readonly?: boolean
      noFocus?: boolean
    }, renderContent: (ref: React.RefObject<HTMLElement>) => JSX.Element) {
      return <HookRender key={current.value} render={function () {
        const ref = useRef<HTMLElement>(null)
        useEffect(() => {
          const div = ref.current!
          if (args.readonly) {
            div.contentEditable = 'false'
          } else {
            div.contentEditable = contentEditableText + ''
          }
        }, [args.readonly])
        useEffect(() => {
          if (args.noFocus) {
            return
          }
          const div = ref.current!
          fixScroll(div, current)
        }, emptyArray)
        return renderContent(ref)
      }} />
    }
  }
}
