import { CSSProperties, domTagNames } from 'wy-dom-helper';
import { createOrProxy } from 'wy-helper';
import React from 'react';
import { DomCreater } from './attr';

type DomElements = React.ReactHTML;
export type DomElementType = keyof DomElements;
export type DomAttribute<T extends DomElementType> =
  DomElements[T] extends React.DetailedHTMLFactory<infer Attr, any>
    ? Omit<Attr, 'dangerouslySetInnerHTML'>
    : never;
export type DomElement<T extends DomElementType> =
  DomElements[T] extends React.DetailedHTMLFactory<any, infer N> ? N : never;
export type DomAttributeS<T extends DomElementType> = Omit<
  DomAttribute<T>,
  'style'
> & {
  style: CSSProperties;
};
export type DomAttributeSO<T extends DomElementType> = Omit<
  DomAttribute<T>,
  'style'
> & {
  style?: CSSProperties;
};

export const dom: {
  readonly [key in DomElementType]: {
    (
      props?: DomAttribute<key> | DomAttributeSO<key>,
      portal?: Node
    ): DomCreater<DomAttribute<key>, key>;
    (
      fun: (v: DomAttributeS<key>) => DomAttributeS<key> | void,
      portal?: Node
    ): DomCreater<DomAttribute<key>, key>;
  };
} = createOrProxy(domTagNames, function (tag) {
  return function (args: any) {
    const creater = DomCreater.instance;
    creater.type = tag;
    creater.attrsEffect = args;
    return creater;
  };
}) as any;
