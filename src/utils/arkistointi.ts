import { Opetussuunnitelmat } from '@shared/api/amosaa';
import { $bvModal, $fail, $success, $t } from '@shared/utils/globals';
import { useRoute, useRouter } from 'vue-router';

export async function vaihdaOpetussunnitelmaTilaConfirm(instance, meta) {
  const arkistoi = await $bvModal.msgBoxConfirm($t(meta.confirm) as any, {
    title: $t(meta.title),
    okVariant: 'primary',
    okTitle: $t('kylla') as any,
    cancelVariant: 'link',
    cancelTitle: $t('peruuta') as any,
    centered: true,
  });

  if (arkistoi) {
    const toteutussuunnitelmaId = meta.toteutussuunnitelmaId ? meta.toteutussuunnitelmaId : instance.route.params.toteutussuunnitelmaId;

    try {
      await Opetussuunnitelmat.updateOpetussuunnitelmaTila(toteutussuunnitelmaId, meta.tila, instance.route.params.koulutustoimijaId as string);
      switch (meta.tila) {
      case 'POISTETTU':
        $success($t('arkistoi-suunnitelma-onnistui'));
        break;
      case 'LUONNOS':
        $success($t('palautus-onnistui'));
        break;
      case 'VALMIS':
        $success($t('tilan-vaihto-valmis-onnistui'));
        break;
      default:
        break;
      }
    }
    catch (e) {
      $fail($t('tilan-vaihto-epaonnistui'));
    }

    if (meta.reroute) {
      instance.router.push({
        name: meta.reroute,
      });
    }

    if (meta.callback) {
      await meta.callback();
    }
  }
}
