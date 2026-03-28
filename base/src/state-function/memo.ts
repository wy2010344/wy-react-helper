import {
  createUseBaseMemo,
  createUseMemoHelper,
  MemoEvent,
} from 'wy-helper/state-function';
import { hookStateHoder } from './StateHolder';
import { hookCurrentEnvModel } from './EnvModel';

/**
 * 通过返回函数,能始终通过函数访问fiber上的最新值
 * @param effect
 * @param deps
 * @returns
 */
export const useBaseMemo = createUseBaseMemo(
  hookStateHoder,
  hookCurrentEnvModel
);

const {
  useMemo,
  useConst,
  useConstFrom,
  useConstDep,
  useAtomBind,
  useAtomBindFun,
  useAtom,
  useAtomFun,
  useRef,
  useRefFrom,
  useLaterSetGet,
  useAlaways,
  useRefConstWith,
  useMemoVersion,
} = createUseMemoHelper(useBaseMemo);

export {
  useMemo,
  useConst,
  useConstFrom,
  useConstDep,
  useAtomBind,
  useAtomBindFun,
  useAtom,
  useAtomFun,
  useRef,
  useRefFrom,
  useLaterSetGet,
  useAlaways,
  useRefConstWith,
  useMemoVersion,
};
