#include <stdio.h>

int main() {
  char name[64];
  printf("Enter your name: ");
  scanf("%63s", name);
  printf("Hello, %s!\n", name);
  return 0;
}
