import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

import { createRevenueCatPurchases } from '@/purchases/revenuecat';
import { tr } from '@/i18n';

/**
 * Compras de Lumi Plus. La app solo conoce esta interfaz.
 *
 * - RevenueCat (`purchases/revenuecat.ts`): en un development build o en la
 *   versión de la tienda, con `EXPO_PUBLIC_REVENUECAT_IOS_KEY`. Los precios
 *   llegan ya localizados por la App Store y `settings.isPlus` sigue al
 *   entitlement "plus" (ver `PlusSync`).
 * - Mock: en desarrollo, Expo Go y web. Precios fijos y compras que salen
 *   bien tras ~800 ms; no cobra nada. En una build de la tienda sin clave, las
 *   compras quedan no disponibles (nunca el mock).
 *
 * Las chispas nunca se venden: aquí solo hay suscripciones a Plus.
 */

export type PlusPackageId = 'annual' | 'monthly';

export type PlusPackage = {
  id: PlusPackageId;
  /** "Anual", "Mensual". */
  title: string;
  /** Precio tal como lo da la tienda, ya formateado ("49,99 $"). */
  price: string;
  period: 'year' | 'month';
  /** Días de prueba gratis (0 si no tiene). */
  trialDays: number;
  /** Equivalente al mes ("4,17 $/mes"). */
  perMonth: string;
  /** Ahorro frente a pagar mes a mes, en % (solo el anual). */
  savingsPercent?: number;
};

export type PurchaseResult = { status: 'purchased' } | { status: 'cancelled' };
export type RestoreResult = { isPlus: boolean };

export interface PurchasesSource {
  getOfferings(): Promise<PlusPackage[]>;
  /** Lanza un error si la tienda falla; si el usuario cancela, devuelve `cancelled`. */
  purchase(packageId: PlusPackageId): Promise<PurchaseResult>;
  restore(): Promise<RestoreResult>;
  /** Estado real de la suscripción (solo con tienda de verdad). */
  getIsPlus?(): Promise<boolean>;
  /** Avisa cuando cambia (renovación, caducidad, compra en otro dispositivo). */
  onPlusChange?(listener: (isPlus: boolean) => void): () => void;
  /** Liga las compras a la cuenta de Lumi (o la suelta con null). */
  setUser?(userId: string | null): Promise<void>;
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function createMockPurchases(): PurchasesSource {
  const price = (n: string) =>
    tr({ es: `${n.replace('.', ',')} $`, en: `$${n}`, zh: `US$${n}`, hi: `$${n}`, fr: `${n.replace('.', ',')} $` });
  const perMonth = (n: string) =>
    tr({
      es: `${price(n)}/mes`,
      en: `${price(n)}/mo`,
      zh: `${price(n)}/月`,
      hi: `${price(n)}/महीना`,
      fr: `${price(n)}/mois`,
    });
  const packages: PlusPackage[] = [
    {
      id: 'annual',
      title: tr({ es: 'Anual', en: 'Yearly', zh: '年付', hi: 'सालाना', fr: 'Annuel' }),
      price: price('49.99'),
      period: 'year',
      trialDays: 7,
      perMonth: perMonth('4.17'),
      savingsPercent: 40,
    },
    {
      id: 'monthly',
      title: tr({ es: 'Mensual', en: 'Monthly', zh: '月付', hi: 'मासिक', fr: 'Mensuel' }),
      price: price('6.99'),
      period: 'month',
      trialDays: 0,
      perMonth: perMonth('6.99'),
    },
  ];
  // Solo en memoria: lo que "compras" en esta sesión se puede restaurar.
  let purchased = false;

  return {
    async getOfferings() {
      await wait(150);
      return packages;
    },
    async purchase() {
      await wait(800);
      purchased = true;
      return { status: 'purchased' };
    },
    async restore() {
      await wait(800);
      return { isPlus: purchased };
    },
  };
}

const REVENUECAT_IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '';
const inExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

/** `true` si las compras son de verdad (RevenueCat); `false` con el mock. */
export const realStore = Platform.OS === 'ios' && !inExpoGo && !!REVENUECAT_IOS_KEY;

/**
 * Una build de iOS para la tienda sin la clave de RevenueCat no puede usar el
 * mock (Plus saldría gratis): las compras quedan no disponibles. El mock es
 * solo para desarrollo, Expo Go y la web.
 */
const storeBuildWithoutKey = Platform.OS === 'ios' && !inExpoGo && !__DEV__ && !REVENUECAT_IOS_KEY;

export const purchases: PurchasesSource = realStore
  ? createRevenueCatPurchases(REVENUECAT_IOS_KEY)
  : storeBuildWithoutKey
    ? createUnavailablePurchases()
    : createMockPurchases();

/** Sin tienda: no hay planes y comprar o restaurar falla (el paywall lo explica). */
function createUnavailablePurchases(): PurchasesSource {
  const fail = () => Promise.reject(new Error('Compras no configuradas (falta EXPO_PUBLIC_REVENUECAT_IOS_KEY)'));
  return {
    getOfferings: async () => [],
    purchase: fail,
    restore: fail,
  };
}
