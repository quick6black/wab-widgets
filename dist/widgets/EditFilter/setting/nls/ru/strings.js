define({
  "configText": "Задайте фильтр групп ниже",
  "labels": {
    "groupName": "Задать имя фильтра:",
    "groupNameTip": "Название фильтра, который будет выбираться пользователем.",
    "groupDesc": "Описание:",
    "groupDescTip": "Описание заданного фильтра.",
    "groupOperator": "Предустановленный оператор:",
    "groupOperatorTip": "Опция предварительного задания оператора фильтра. Если Предустановленный оператор не выбран, в фильтре будет использоваться оператор Равно.",
    "groupDefault": "Предустановленное значение:",
    "groupDefaultTip": "Опция выбора значения из имеющегося слоя.",
    "sameLayerAppend": "Если один слой указывается несколько раз, используйте между полями следующий оператор:",
    "sameLayerConjunc": "Присоединить с помощью:"
  },
  "buttons": {
    "addNewGroup": "Добавить новую группу",
    "addNewGroupTip": "Добавить новый набор фильтров",
    "addLayer": "Добавить слой",
    "addLayerTip": "Добавить слой к набору фильтров."
  },
  "inputs": {
    "groupName": "Присвоить имя группе",
    "groupDesc": "Описание группы",
    "groupDefault": "Введите предустановленное значение",
    "simpleMode": "Начать в Простом виде",
    "simpleModeTip": "Опция упрощения настроенного интерфейса виджета. Если включено, из интерфейса будут убраны кнопки добавления критериев и ниспадающий список операторов.",
    "webmapAppendMode": "Присоединить фильтр к имеющемуся фильтру веб-карты с помощью ",
    "webmapAppendModeTip": "Опция для присоединения набора фильтров к имеющемуся фильтру веб-карты. Поддерживаются операторы OR и AND.",
    "optionsMode": "Скрыть опции виджета",
    "optionsModeTip": "Опция для отображения дополнительных настроек виджета. При включении, сохранение и загрузка заданных фильтров, а также применение фильтра после закрытия виджета убираются из интерфейса.",
    "optionOR": "OR",
    "optionAND": "AND",
    "optionEQUAL": "EQUALS",
    "optionNOTEQUAL": "NOT EQUAL",
    "optionGREATERTHAN": "GREATER THAN",
    "optionGREATERTHANEQUAL": "GREATER THAN OR EQUAL",
    "optionLESSTHAN": "LESS THAN",
    "optionLESSTHANEQUAL": "LESS THAN OR EQUAL",
    "optionSTART": "BEGINS WITH",
    "optionEND": "ENDS WITH",
    "optionLIKE": "CONTAINS",
    "optionNOTLIKE": "DOES NOT CONTAIN",
    "optionONORBEFORE": "СООТВЕТСТВУЕТ ИЛИ ДО",
    "optionONORAFTER": "СООТВЕТСТВУЕТ ИЛИ ПОСЛЕ",
    "optionNONE": "NONE"
  },
  "tables": {
    "layer": "Слои",
    "layerTip": "Имя слоя, как определено на карте.",
    "field": "Поля",
    "fieldTip": "Поле, по которому будет фильтроваться слой.",
    "value": "Использовать значение",
    "valueTip": "Опция для использования ниспадающего списка значений слоя. Если ни один слой не использует этот параметр, пользователь увидит простое текстовое поле.",
    "zoom": "Масштабировать",
    "zoomTip": "Опция приближения к экстенту объектов после применения фильтра. Для масштабирования можно выбрать только один слой.",
    "action": "Удалить",
    "actionTip": "Удалить слой из набора фильтров."
  },
  "popup": {
    "label": "Выбрать значение"
  },
  "errors": {
    "noGroups": "Необходима, как минимум, одна группа.",
    "noGroupName": "Имя одной или нескольких групп отсутствует.",
    "noDuplicates": "Имя одной или нескольких групп повторяются.",
    "noRows": "Необходима, как минимум, одна строка в таблице.",
    "noLayers": "На карте нет слоев."
  },
  "picker": {
    "description": "Используйте эту форму, чтобы найти предустановленное значение для этой группы.",
    "layer": "Выберите слой",
    "layerTip": "Имя слоя, как определено на веб-карте.",
    "field": "Выберите поле",
    "fieldTip": "Поле, по которому будет задаваться имеющееся значение.",
    "value": "Выберите значение",
    "valueTip": "Значение, которое будет использоваться в виджете по умолчанию."
  }
});