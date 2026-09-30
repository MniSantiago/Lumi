import { useEffect, useRef, type ReactNode } from 'react';
import { Platform, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTour } from '@/tour/context';

/** Lo poco que usamos del nodo DOM que hay detrás de una `View` en la web. */
type DomNode = {
  addEventListener: (type: 'click', listener: () => void, capture: boolean) => void;
  removeEventListener: (type: 'click', listener: () => void, capture: boolean) => void;
};

/**
 * Marca un trozo de pantalla como algo que un tutorial puede señalar. No cambia
 * cómo se ve: solo lo registra con su id para medirlo, y avisa cuando lo tocan
 * (los pasos `tap` avanzan al tocar el elemento de verdad, que sigue funcionando).
 */
export function TourTarget({ id, children, style }: { id: string; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const ref = useRef<View>(null);
  const { register, tapped } = useTour();
  useEffect(() => register(id, ref), [id, register]);

  // En el móvil llegan los eventos táctiles (`onTouchEnd`). En la web, con ratón, solo el
  // clic, y un botón de dentro lo detiene: lo escuchamos en el nodo, en la fase de captura.
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const node = ref.current as unknown as DomNode | null;
    const onClick = () => tapped(id);
    node?.addEventListener('click', onClick, true);
    return () => node?.removeEventListener('click', onClick, true);
  }, [id, tapped]);

  return (
    <View ref={ref} collapsable={false} style={style} onTouchEnd={() => tapped(id)}>
      {children}
    </View>
  );
}
