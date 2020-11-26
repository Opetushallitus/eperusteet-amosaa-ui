import { Opetussuunnitelmat } from '@shared/api/amosaa';

export async function arkistoiOpetussuunnitelma(el, meta) {
  const arkistoi = await el.$bvModal.msgBoxConfirm(el.$t(meta.confirm) as any, {
    title: el.$t(meta.title),
    okVariant: 'primary',
    okTitle: el.$t('kylla') as any,
    cancelVariant: 'link',
    cancelTitle: el.$t('peruuta') as any,
    centered: true,
  });

  if (arkistoi) {
    try {
      await Opetussuunnitelmat.updateOpetussuunnitelmaTila(el.$route.params.toteutussuunnitelmaId as number, meta.tila, el.$route.params.koulutustoimijaId);
      switch (meta.tila) {
      case 'POISTETTU':
        el.$success(el.$t('arkistoi-suunnitelma-onnistui'));
        break;
      case 'LUONNOS':
        el.$success(el.$t('palautus-onnistui'));
        break;
      default:
        break;
      }
    }
    catch (e) {
      el.$fail(el.$t('arkistointi-epaonnistui'));
    }

    if (meta.reroute) {
      el.$router.push({
        name: meta.reroute,
      });
    }

    if (meta.callback) {
      await meta.callback();
    }
  }
}
