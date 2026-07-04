import 'package:flutter_test/flutter_test.dart';
import 'package:zipra/main.dart';

void main() {
  testWidgets('App launches with splash screen', (WidgetTester tester) async {
    await tester.pumpWidget(const ZipraApp());
    expect(find.text('Zipra'), findsOneWidget);
  });
}
