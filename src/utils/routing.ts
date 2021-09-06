import { NavigationNodeDto } from '@shared/tyypit';
import { Location } from 'vue-router/types/router';
import * as _ from 'lodash';
import { ILinkkiHandler } from '@shared/components/EpContent/LinkkiHandler';

const ignoredRouteNames = [];

export function routeToNode(route: Location): NavigationNodeDto | null {
  if (!route || _.includes(ignoredRouteNames, route.name)) {
    return null;
  }

  switch (route.name) {
  case 'toteutussuunnitelma':
    return {
      type: 'root',
      id: Number(route.params?.toteutussuunnitelmaId!),
    };
  case 'toteutussuunnitelmantiedot':
    return {
      type: 'tiedot',
      id: Number(route.params?.toteutussuunnitelmaId!),
    };
  case 'tekstikappale':
    return {
      type: 'tekstikappale',
      id: Number(route.params?.sisaltoviiteId!),
    };
  case 'opintokokonaisuus':
    return {
      type: 'opintokokonaisuus',
      id: Number(route.params?.sisaltoviiteId!),
    };
  case 'koulutuksenosa':
    return {
      type: 'koulutuksenosa',
      id: Number(route.params?.sisaltoviiteId!),
    };
  case 'koulutuksenosat':
    return {
      type: 'koulutuksenosat',
    };
  default:
    console.error('Unknown route', route.name, route);
    break;
  }

  return null;
}

export function nodeToRoute(node: NavigationNodeDto): Location | null {
  if (!node) {
    return null;
  }

  switch (node.type) {
  case 'tutkinnonosat':
    return {
      name: 'tutkinnonosat',
    };
  case 'suorituspolut':
    return {
      name: 'suorituspolut',
      params: {
        sisaltoviiteId: _.toString(node.id),
      },
    };
  case 'tutkinnonosa':
    return {
      name: 'tutkinnonosa',
      params: {
        sisaltoviiteId: _.toString(node.id),
      },
    };
  case 'suorituspolku':
    return {
      name: 'suorituspolku',
      params: {
        sisaltoviiteId: _.toString(node.id),
      },
    };
  case 'tekstikappale':
    return {
      name: 'tekstikappale',
      params: {
        sisaltoviiteId: _.toString(node.id),
      },
    };
  case 'opintokokonaisuus':
    return {
      name: 'opintokokonaisuus',
      params: {
        sisaltoviiteId: _.toString(node.id),
      },
    };
  case 'koulutuksenosat':
    return {
      name: 'opintokokonaisuus',
    };
  case 'koulutuksenosa':
    return {
      name: 'koulutuksenosa',
      params: {
        sisaltoviiteId: _.toString(node.id),
      },
    };
  case 'laajaalainenosaaminen':
    return {
      name: 'laajaalainenosaaminen',
      params: {
        sisaltoviiteId: _.toString(node.id),
      },
    };
  default:
    console.error('Unknown node', node.type);
    break;
  }
  return null;
};

export class LinkkiHandler implements ILinkkiHandler {
  nodeToRoute(node: NavigationNodeDto): Location | null {
    return nodeToRoute(node);
  }
}
