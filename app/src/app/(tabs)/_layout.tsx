import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { Colors, Fonts } from '@/constants/theme';

export default function TabsLayout() {
  return (
    // Cristal: en iOS 26+ el sistema dibuja Liquid Glass; hasta iOS 18, desenfoque oscuro.
    <NativeTabs
      blurEffect="systemUltraThinMaterialDark"
      disableTransparentOnScrollEdge
      tintColor={Colors.amber}
      iconColor={{ default: Colors.textTertiary, selected: Colors.amber }}
      labelStyle={{
        default: { color: Colors.textTertiary, fontFamily: Fonts.bodyMedium },
        selected: { color: Colors.amber, fontFamily: Fonts.bodySemiBold },
      }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Hogar</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} md="home" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="expediciones">
        <NativeTabs.Trigger.Label>Expediciones</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'map', selected: 'map.fill' }} md="map" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="coleccion">
        <NativeTabs.Trigger.Label>Colección</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'book.closed', selected: 'book.closed.fill' }} md="collections_bookmark" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="progreso">
        <NativeTabs.Trigger.Label>Progreso</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'sparkles', selected: 'sparkles' }} md="auto_awesome" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="ajustes">
        <NativeTabs.Trigger.Label>Ajustes</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'gearshape', selected: 'gearshape.fill' }} md="settings" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
