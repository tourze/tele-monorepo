import {useAsyncEffect, useSafeState} from 'ahooks';

function useReady(): boolean {
  const [show, setShow] = useSafeState<boolean>(false);
  useAsyncEffect(async () => {
    await setShow(true);
  }, []);
  return show;
}

export default useReady;
