import { StyleSheet, TextInput, FlatList, View, Text } from "react-native";
import { theme } from "../theme";
import { ShoppingListItem } from "../components/ShoppingListItem";
import { useEffect, useState } from "react";
import { getFromStorage, saveToStorage } from "../utils/storage";

const storageKey = "shopping-list";

type ShoppingListItemType = {
  id: string;
  name: string;
  completedAtTimestamp?: number;
  lastUpdatedTimestamp: number;
};

export default function App() {
  const [value, setValue] = useState("");
  const [shoppingList, setShoppingList] = useState<ShoppingListItemType[]>([]);

  useEffect(() => {
    const fetchInitial = async () => {
      const data = await getFromStorage(storageKey);
      if (data) {
        setShoppingList(data);
      }
    };
    fetchInitial();
  }, []);

  const handleSubmit = () => {
    if (value) {
      const newShoppingList = [
        { id: new Date().toTimeString(), name: value, lastUpdatedTimestamp: Date.now() },
        ...shoppingList,
      ];
      setShoppingList(newShoppingList);
      saveToStorage(storageKey, newShoppingList);
      setValue("");
    }
  };

  const handleDelete = (id: string) => {
    const newShoppingList = shoppingList.filter((item) => item.id !== id);
    setShoppingList(newShoppingList);
    saveToStorage(storageKey, newShoppingList);
  };

  const handleToggleComplete = (id: string) => {
    const newShoppingList = shoppingList.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          completedAtTimestamp: item.completedAtTimestamp ? undefined : Date.now(),
          lastUpdatedTimestamp: Date.now(),
        };
      }
      return item;
    });
    setShoppingList(newShoppingList);
    saveToStorage(storageKey, newShoppingList);
  };

  return (
    <FlatList
      data={orderShoppingList(shoppingList)}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      stickyHeaderIndices={[0]}
      ListEmptyComponent={
        <View style={styles.listEmptyContainer}>
          <Text>Your shopping list is empty</Text>
        </View>
      }
      renderItem={({ item }) => (
        <ShoppingListItem
          name={item.name}
          onDelete={() => handleDelete(item.id)}
          onToggleComplete={() => handleToggleComplete(item.id)}
          isCompleted={Boolean(item.completedAtTimestamp)}
        />
      )}
      ListHeaderComponent={
        <TextInput
          style={styles.textInput}
          placeholder="E.g. Coffee"
          value={value}
          onChangeText={setValue}
          // keyboardType
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />
      }
    />
  );
}

function orderShoppingList(shoppingList: ShoppingListItemType[]) {
  return shoppingList.sort((item1, item2) => {
    if (item1.completedAtTimestamp && item2.completedAtTimestamp) {
      return item2.completedAtTimestamp - item1.completedAtTimestamp;
    }
    if (item1.completedAtTimestamp && !item2.completedAtTimestamp) {
      return 1;
    }
    if (!item1.completedAtTimestamp && item2.completedAtTimestamp) {
      return -1;
    }
    if (!item1.completedAtTimestamp && !item2.completedAtTimestamp) {
      return item2.lastUpdatedTimestamp - item1.lastUpdatedTimestamp;
    }
    return 0;
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colorWhite,
    paddingVertical: 12,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  textInput: {
    borderColor: theme.colorGrey,
    borderWidth: 2,
    padding: 12,
    marginHorizontal: 12,
    marginBottom: 12,
    fontSize: 18,
    borderRadius: 50,
    backgroundColor: theme.colorWhite,
  },
  listEmptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 18,
  },
});
