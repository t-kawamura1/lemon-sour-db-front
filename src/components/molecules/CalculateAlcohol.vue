<template>
  <div class="calculate-alcohol">
    <div class="calculate-alcohol-error-messages-box">
      <error-message
        class="calculate-alcohol-record-error-messages"
        v-for="(errorMessage, index) in errorMessages"
        :key="`record-error-${index}`"
        :error-message-text="errorMessage"
      ></error-message>
      <error-message
        class="calculate-alcohol-formula-plus-minus-error-message"
        :error-message-text="plusMinusError"
      ></error-message>
      <error-message
        class="calculate-alcohol-formula-input-error-message"
        :error-message-text="formulaError"
      ></error-message>
    </div>
    <day-date-picker
      class="calculate-alcohol-date-picker"
      @input="setDrinkingDate"
    ></day-date-picker>
    <input-select
      class="calculate-alcohol-sour-select"
      :sort-type="soursSelect[0]"
      :sort-values="soursSelect[1]"
      :init-value="sourName"
      @input="setAlcoholContent"
    ></input-select>
    <div class="calculate-alcohol-formula-box">
      <div
        class="calculate-alcohol-formula"
        v-for="index in formulaCounts"
        :key="index"
      >
        <div class="calculate-alcohol-formula-alcohol-content">
          <input-number
            class="calculate-alcohol-formula-alcohol-content-input"
            :input-number-attributes="alcoholInputs.alcContent"
            :init-value="alcContentForDisplay"
            @input="setAlcContentForCalc(index, $event.target.value)"
          ></input-number>
          <span class="calculate-alcohol-formula-alcohol-content-unit">%</span>
        </div>
        <icon
          class="calculate-alcohol-formula-x-icon"
          :icon-text="iconTexts[0]"
        ></icon>
        <div class="calculate-alcohol-formula-amount">
          <input-select
            class="calculate-alcohol-formula-amount-input"
            :sort-type="alcoholInputs.amountSelect.sortType"
            :sort-values="alcoholInputs.amountSelect.sortValues"
            :init-value="alcoholInputs.amountSelect.initValue"
            @input="setDrinkAmountForCalc(index, $event)"
          ></input-select>
          <span class="calculate-alcohol-formula-amount-unit">ml</span>
        </div>
        <icon
          class="calculate-alcohol-formula-x-icon"
          :icon-text="iconTexts[0]"
        ></icon>
        <div class="calculate-alcohol-formula-counts">
          <input-number
            class="calculate-alcohol-formula-counts-input"
            :input-number-attributes="alcoholInputs.drinkingCounts"
            @input="setDrinkCountsForCalc(index, $event.target.value)"
          ></input-number>
          <span class="calculate-alcohol-formula-counts-unit">本</span>
        </div>
      </div>
      <div class="calculate-alcohol-formula-plus" @click="plusFormula">
        <icon
          class="calculate-alcohol-formula-plus-icon"
          :icon-text="iconTexts[1]"
        ></icon>
        <p class="calculate-alcohol-formula-plus-text">計算式を追加</p>
      </div>
      <div class="calculate-alcohol-formula-minus" @click="minusFormula">
        <icon
          class="calculate-alcohol-formula-minus-icon"
          :icon-text="iconTexts[2]"
        ></icon>
        <p class="calculate-alcohol-formula-minus-text">計算式を削除</p>
      </div>
    </div>
    <div class="calculate-alcohol-result-box">
      <icon
        class="calculate-alcohol-arrow-icon"
        :icon-text="iconTexts[3]"
      ></icon>
      <span class="calculate-alcohol-calculation-result">
        {{ totalAmountOfPureAlc }}
      </span>
      <span class="calculate-alcohol-input-unit">g</span>
    </div>
    <div
      class="calculate-alcohol-supplement-button"
      @click="isActive = !isActive"
    >
      {{ calculationSupplementTexts[0] }}
    </div>
    <text-calculation-supplement
      class="calculate-alcohol-supplement-text"
      v-show="isActive"
      v-for="(calcSuppleText, index) in calculationSupplementTexts[1]"
      :key="index"
      :supplement-text="calcSuppleText"
    ></text-calculation-supplement>
    <div class="calculate-alcohol-members-only-button-box">
      <button-calculation-record
        class="calculate-alcohol-calc-record-button"
        :button-calc-record-text="recordButtons[0]"
        @record="checkNaNAndZero"
      ></button-calculation-record>
      <button-zero-record
        class="calculate-alcohol-zero-record-button"
        :button-zero-record-text="recordButtons[1]"
        @zeroRecord="checkEmitModal"
      ></button-zero-record>
    </div>
    <button-twitter
      class="calculate-alcohol-tweet-button"
      :pure-alc="totalAmountOfPureAlc"
    ></button-twitter>
  </div>
</template>

<script>
import ErrorMessage from "@/components/atoms/ErrorMessage";
import DayDatePicker from "@/components/atoms/DayDatePicker";
import InputSelect from "@/components/atoms/InputSelect";
import InputNumber from "@/components/atoms/InputNumber";
import Icon from "@/components/atoms/Icon";
import TextCalculationSupplement from "@/components/atoms/TextCalculationSupplement";
import ButtonCalculationRecord from "@/components/atoms/ButtonCalculationRecord";
import ButtonZeroRecord from "@/components/atoms/ButtonZeroRecord";
import ButtonTwitter from "@/components/atoms/ButtonTwitter";

export default {
  components: {
    ErrorMessage,
    DayDatePicker,
    InputSelect,
    InputNumber,
    Icon,
    TextCalculationSupplement,
    ButtonCalculationRecord,
    ButtonZeroRecord,
    ButtonTwitter,
  },
  props: {
    calculationSupplementTexts: Array,
    errorMessages: Array,
    soursSelect: Array,
    lemonSours: Array,
    alcoholInputs: Object,
    iconTexts: Array,
    recordButtons: Array,
    todaySour: Object,
  },
  data() {
    return {
      plusMinusError: "",
      formulaError: "",
      soursSelectBox: [],
      sourName: this.soursSelect[1][0],
      alcContentForDisplay: null,
      formulaCounts: 1,
      alcContentForCalc: [],
      drinkAmountForCalc: [],
      drinkCountsForCalc: [],
      calcResults: [],
      totalAmountOfPureAlc: "0",
      isActive: false,
      recordData: {
        drinking_record: {
          user_id: "",
          lemon_sour_id: "",
          drinking_date: "",
          pure_alcohol_amount: "",
          drinking_amount: "",
        },
      },
    };
  },
  methods: {
    setAlcoholContent(sourName) {
      const selectedSour = this.lemonSours.find((ele) => ele.name == sourName);
      this.recordData.drinking_record.lemon_sour_id = selectedSour.id;
      const selectedSourAlcContent = selectedSour.alcohol_content;
      const alcContentInputs = document.querySelectorAll(
        ".calculate-alcohol-formula-alcohol-content-input"
      );
      for (let index = 0; index < alcContentInputs.length; index++) {
        alcContentInputs[index].value = selectedSourAlcContent;
        this.alcContentForCalc[index] = selectedSourAlcContent;
      }
    },
    setDrinkingDate(date) {
      this.recordData.drinking_record.drinking_date = date;
      this.$emit("passDate", date);
    },
    setAlcContentForCalc(index, value) {
      this.alcContentForCalc[index - 1] = value;
      if (
        !!this.drinkAmountForCalc[index - 1] &&
        !!this.drinkCountsForCalc[index - 1]
      ) {
        this.sumPureAlcohol();
      }
    },
    setDrinkAmountForCalc(index, value) {
      this.drinkAmountForCalc[index - 1] = value;
      if (
        !!this.alcContentForCalc[index - 1] &&
        !!this.drinkCountsForCalc[index - 1]
      ) {
        this.sumPureAlcohol();
      }
    },
    setDrinkCountsForCalc(index, value) {
      this.drinkCountsForCalc[index - 1] = value;
      if (
        !!this.alcContentForCalc[index - 1] &&
        !!this.drinkAmountForCalc[index - 1]
      ) {
        this.sumPureAlcohol();
      }
    },
    sumPureAlcohol() {
      let sum = 0;
      for (let index = 0; index < this.alcContentForCalc.length; index++) {
        this.calcResults[index] =
          (this.alcContentForCalc[index] / 100) *
          this.drinkAmountForCalc[index] *
          this.drinkCountsForCalc[index] *
          0.8;
      }
      const resultsRemovedNaN = this.calcResults.filter((result) => result);
      for (let index = 0; index < resultsRemovedNaN.length; index++) {
        sum += resultsRemovedNaN[index];
      }
      this.totalAmountOfPureAlc = parseFloat(sum).toFixed(1);
    },
    checkNaNAndZero() {
      if (this.checkAuth() === "stop") {
        return;
      } else {
        if (this.validateFormulaInputs() === "error") {
          return;
        } else {
          if (this.calcResults.includes(0)) {
            this.formulaError = "いずれかの計算式の結果が0になっています";
          } else {
            this.formulaError = "";
            this.replaceRecordData();
          }
        }
      }
    },
    checkEmitModal() {
      if (this.checkAuth() === "stop") {
        return;
      } else {
        this.$emit("modal", "記録の確認");
      }
    },
    checkAuth() {
      if (!this.$cookies.isKey("auth-header")) {
        this.$emit("noticeAuth");
        return "stop";
      }
    },
    validateFormulaInputs() {
      if (this.calcResults.includes(NaN) || this.calcResults.length === 0) {
        this.formulaError = "計算式に入力されていない項目があります";
        return "error";
      } else if (this.formulaCounts !== this.calcResults.length) {
        this.formulaError = "計算式に入力されていない項目があります";
        return "error";
      } else {
        this.formulaError = "";
      }
    },
    replaceRecordData() {
      this.recordData.drinking_record.drinking_amount =
        this.drinkAmountForCalc.reduce((sum, ele) => sum + parseInt(ele), 0);
      this.recordData.drinking_record.pure_alcohol_amount =
        this.totalAmountOfPureAlc;
      this.$emit("submitRecord", this.recordData);
    },
    plusFormula() {
      if (10 > this.formulaCounts) {
        this.plusMinusError = "";
        this.formulaCounts += 1;
      } else {
        this.plusMinusError = "これ以上増やせません";
      }
    },
    minusFormula() {
      if (this.formulaCounts >= 2) {
        this.plusMinusError = "";
        this.formulaCounts -= 1;
      } else {
        this.plusMinusError = "これ以上減らせません";
      }
    },
  },
  created() {
    if (this.todaySour !== undefined) {
      this.sourName = this.todaySour.name;
      this.alcContentForDisplay = this.todaySour.alcohol_content;
      for (let index = 0; index < this.formulaCounts; index++) {
        this.alcContentForCalc.push(this.todaySour.alcohol_content);
      }
    }
  },
};
</script>

<style scoped lang="scss">
.calculate-alcohol {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: $font-color-bg-white;
  .calculate-alcohol-error-messages-box {
    margin-bottom: 15px;
    .calculate-alcohol-record-error-messages {
      margin-bottom: 6px;
    }
    .calculate-alcohol-formula-plus-minus-error-message {
      margin-bottom: 6px;
    }
  }
  .calculate-alcohol-date-picker {
    margin-bottom: 15px;
  }
  .calculate-alcohol-sour-select {
    padding: 9px 0 9px 3px;
    font-size: 1.5rem;
    margin-bottom: 30px;
  }
  .calculate-alcohol-formula-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 1.6rem;
    margin-bottom: 30px;
    .calculate-alcohol-formula {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 320px;
      margin-bottom: 6px;
      .calculate-alcohol-formula-alcohol-content {
        .calculate-alcohol-formula-alcohol-content-input {
          padding: 9px 0 9px 6px;
          margin-right: 3px;
        }
      }
      .calculate-alcohol-formula-x-icon {
        font-size: 2rem;
      }
      .calculate-alcohol-formula-amount {
        .calculate-alcohol-formula-amount-input {
          padding: 9px 3px 9px 6px;
          margin-right: 3px;
        }
      }
      .calculate-alcohol-formula-counts {
        .calculate-alcohol-formula-counts-input {
          padding: 9px 6px;
          margin-right: 3px;
        }
      }
    }
    .calculate-alcohol-formula-plus {
      display: flex;
      align-items: center;
      margin-top: 12px;
      color: $dark-green;
      cursor: pointer;
      &:hover {
        opacity: 0.7;
      }
      .calculate-alcohol-formula-plus-icon {
        margin-right: 6px;
        font-size: 2rem;
      }
    }
    .calculate-alcohol-formula-minus {
      display: flex;
      align-items: center;
      margin-top: 12px;
      color: $error-red;
      cursor: pointer;
      &:hover {
        opacity: 0.7;
      }
      .calculate-alcohol-formula-minus-icon {
        margin-right: 6px;
        font-size: 2rem;
      }
    }
  }
  .calculate-alcohol-result-box {
    display: flex;
    align-items: center;
    font-size: 2.4rem;
    margin-bottom: 30px;
    .calculate-alcohol-arrow-icon {
      margin-right: 30px;
    }
    .calculate-alcohol-calculation-result {
      border-bottom: 4px dotted $light-green;
      padding-bottom: 3px;
      margin-right: 10px;
    }
  }
  .calculate-alcohol-supplement-button {
    margin-bottom: 10px;
    cursor: pointer;
    color: $third-dark-yellow;
    text-align: left;
    &:hover {
      opacity: 0.7;
    }
  }
  .calculate-alcohol-supplement-text {
    font-size: 1.5rem;
    margin-bottom: 6px;
  }
  .calculate-alcohol-members-only-button-box {
    margin: 20px 0;
    font-size: 1.6rem;
    .calculate-alcohol-calc-record-button {
      margin-bottom: 20px;
    }
    .calculate-alcohol-zero-record-button {
      background-color: $light-green;
      border-color: $light-green;
      &:hover {
        background-color: $lightest-yellow;
        border-color: $light-green;
        color: $light-green;
      }
    }
  }
  .calculate-alcohol-tweet-button {
    margin-bottom: 30px;
  }
}
</style>
