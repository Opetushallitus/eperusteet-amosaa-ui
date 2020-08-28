<template>
<li>
  <ep-organization-node :value="value"
                        :is-editing="isEditing"
                        :yhteistyo-map="yhteistyoMap" />
  <div v-if="hasChildren" class="tree">
    <ul>
      <ep-organization-tree v-for="(node, idx) in children"
                            :key="idx"
                            :value="node"
                            :is-editing="isEditing"
                            :yhteistyo-map="yhteistyoMap" />
    </ul>
  </div>
</li>
</template>

<script lang="ts">
import _ from 'lodash';
import { Prop, Component, Vue } from 'vue-property-decorator';

import EpOrganizationNode from '@/components/EpOrganizationTree/EpOrganizationNode.vue';

@Component({
  components: {
    EpOrganizationNode,
  },
  name: 'EpOrganizationTree',
})
export default class EpOrganizationTree extends Vue {
  @Prop({ required: true })
  private value!: any;

  @Prop({ required: true })
  private isEditing!: boolean;

  @Prop({ required: false, default: [] })
  private yhteistyoMap!: any[];

  get hasChildren() {
    return !_.isEmpty(this.value.children);
  }

  get children() {
    return _(this.value.children)
      .sortBy(node => this.$kaanna(node.nimi))
      .value();
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

.organisaatio-title {
  font-size: 1.25rem;
  margin-bottom: 0;
}

.organisaatio-box {
  border: 1px solid #E3E3E3;
  border-left-style: none;
  border-top-right-radius: 0.25rem;
  border-bottom-right-radius: 0.25rem;
  width: 100%;
}

.organisaatio-box-color {
  border: 1px solid #E3E3E3;
  border-top-left-radius: 0.25rem;
  border-bottom-left-radius: 0.25rem;
  background-color: none;
  min-width: 8px;
}

.tree, .tree ul {
    margin: 0;
    padding: 0;
    list-style: none;
}
.tree ul {
    margin-left: 4px;
    position: relative;
}
.tree ul:before {
    content: "";
    display: block;
    width: 0;
    position: absolute;
    top: -1rem;
    bottom: 0;
    left: 0;
    border-left: 1px solid;
    color: #E3E3E3;
}
.tree li {
    margin: 0;
    padding: 0 0 0 1.5rem;
    line-height: 2rem;
    position: relative;
}
.tree ul li:before {
    content: "";
    display: block;
    width: 1.5rem;
    height: 0;
    border-top: 1px solid;
    margin-top: -1px;
    position: absolute;
    top: 2rem;
    left: 0;
    color: #E3E3E3;
}
.tree ul li:last-child:before {
    background: #fff;
    height: auto;
    top: 2rem;
    bottom: 0;
}
</style>
