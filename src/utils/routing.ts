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
  case 'osaalue':
    return {
      type: 'osaalue',
      id: Number(route.params?.osaalueId!),
    };
  case 'tutkinnonosa':
    return {
      type: 'tutkinnonosa',
      id: Number(route.params?.sisaltoviiteId!),
    };
  case 'suorituspolut':
    return {
      type: 'suorituspolut',
    };
  case 'suorituspolku':
    return {
      type: 'suorituspolku',
      id: Number(route.params?.sisaltoviiteId!),
    };
  case 'osasuorituspolku':
    return {
      type: 'osasuorituspolku',
      id: Number(route.params?.sisaltoviiteId!),
    };
  case 'opintokokonaisuus':
    return {
      type: 'opintokokonaisuus',
      id: Number(route.params?.sisaltoviiteId!),
    };
  case 'osaamismerkkikappale':
    return {
      type: 'osaamismerkkikappale',
      id: Number(route.params?.sisaltoviiteId!),
    };
  case 'koulutuksenosa':
    return {
      type: 'koulutuksenosa',
      id: Number(route.params?.sisaltoviiteId!),
    };
  case 'tutkinnonosat':
    return {
      type: 'tutkinnonosat',
    };
  case 'koulutuksenosat':
    return {
      type: 'koulutuksenosat',
    };
  case 'koto_kielitaitotaso':
    return {
      type: 'koto_kielitaitotaso',
    };
  case 'koto_laajaalainenosaaminen':
    return {
      type: 'koto_laajaalainenosaaminen',
    };
  case 'koto_opinto':
    return {
      type: 'koto_opinto',
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
  case 'opetussuunnitelma': {
    return {
      name: 'toteutussuunnitelma',
      params: {
        toteutussuunnitelmaId: _.toString(node.id),
      },
    };
  }
  case 'tiedot': {
    return {
      name: 'toteutussuunnitelmantiedot',
    };
  }
  case 'tutkinnonosat':
    return {
      name: 'tutkinnonosat',
    };
  case 'tutkinnonosat_tuodut':
    return {
      name: 'tutkinnonosat',
    };
  case 'tutkinnonosat_pakolliset':
    return {
      name: 'tutkinnonosat',
    };
  case 'tutkinnonosat_paikalliset':
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
  case 'osaamismerkkikappale':
    return {
      name: 'osaamismerkkikappale',
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
