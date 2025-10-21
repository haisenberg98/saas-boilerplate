import type { Metadata } from 'next';
import Script from 'next/script';

import OrganizationSchema from '@/components/seo/OrganizationSchema';
import ClerkProvider from '@/providers/ClerkProvider';
import ReduxProvider from '@/providers/ReduxProvider';
import TRPCProvider from '@/providers/TRPCProvider';

import { primaryFont, secondaryFont } from './fonts';
import './globals.css';

/*TODO



now onto the next one :



1.1 Email Capture Popup/Modal

Implementation: Create a newsletter signup modal with discount incentive

Trigger: Time-based (10s after page load) + exit-intent

Offer: "10% off your first order + coffee brewing tips"

Integration: Store emails in database + send to Resend for automation

Time: 2-3 hours

1.2 Abandoned Cart Email Automation

Implementation: Track cart state changes, trigger email after 1 hour of inactivity

Email Flow: 3-email sequence (1hr, 24hr, 72hr)

Content: Cart reminder → Add urgency/scarcity → Final discount offer

Integration: Use existing cart persistence + Resend automation

Time: 3-4 hours

1.3 Welcome Email Sequence

Implementation: Triggered on first newsletter signup or account creation

Email Flow: Welcome → Coffee guide → Item recommendations

Integration: Leverage existing React Email templates

Time: 2 hours

Priority 2: Enhanced Wishlist System (MEDIUM ROI)
2.1 Upgrade Existing Favorites

Implementation: Convert heart icons to full wishlist with persistence

Features: Save items, view wishlist page, share wishlist

Integration: Expand existing Favorite component + add database table

Time: 3-4 hours

2.2 Wishlist Email Reminders

Implementation: Weekly email with saved items + price drop alerts

Integration: Connect to wishlist data + Resend

Time: 2 hours

Priority 3: Referral System (LOW EFFORT, HIGH VIRAL POTENTIAL)
3.1 Simple Referral Codes

Implementation: Generate unique codes for users, track usage

Reward: Both referrer and referee get 15% off

Integration: Extend existing discount system

Time: 2-3 hours

3.2 Social Sharing

Implementation: Share buttons on item pages and after purchase

Integration: Web Share API + fallback to copy link

Time: 1 hour

Priority 4: Pre-Order/Coming Soon (BUILDS HYPE)
4.1 Coming Soon Item Pages

Implementation: Special item status + email capture for notifications

Features: Notify when available, early bird discounts

Integration: Add item status field + notification system

Time: 2-3 hours

upload temu items today!
make 2 brew contents (filters and espresso)

FUTURE TODO :
- fix item recommendation in quick recipe mode (how we connect item database with ai)
- fix item recommendation in ai mode (how we connect item database with ai)
- auto generate blog posts or 1 click generate blog post with AI
- edit profile
- give us a feedback
- post category filter
- on add to cart modal :
- there will be a bug after deleting the item image, the old image still be displayed in the modal
- sell digital items on kofe ?
- if digital item, how is the flow ?

ONGOING TODO :
- continously upload posts
- post 1 blog about The Ultimate Guide to Brewing Coffee Outdoors: Tips and Gear You Need
- partner with local blogs or community
- continously upload new items and looking for supplier, your website is up!
*/

const baseUrl = new URL(process.env.NEXT_PUBLIC_DOMAIN || '');

export const metadata: Metadata = {
    metadataBase: baseUrl,
    title: 'Buy Coffee Equipment For Home And Travel NZ | Kofe',
    description:
        'Kofe Limited offers high-quality coffee equipment and supplies for both outdoor adventures and home brewing enthusiasts in New Zealand. Explore our wide range of portable coffee makers, grinders, and brewing kits, perfect for camping, hiking, or enjoying the perfect cup at home. With affordable prices, durable gear, and everything you need for your coffee journey, Kofe is your go-to source for brewing solutions across New Zealand.',
    keywords: [
        // Outdoor Coffee Equipment
        'portable coffee makers for camping',
        'outdoor coffee brewing kits',
        'travel coffee grinders',
        'coffee equipment for hiking',
        'compact coffee makers for outdoor use',
        'camping coffee equipment',
        'portable espresso machines',
        'lightweight coffee brewing gear',
        'adventure coffee brewing kits',
        'durable coffee makers for camping',

        // Home Coffee Enthusiasts
        'coffee makers for home brewing',
        'best coffee grinders for home',
        'home barista coffee equipment',
        'espresso machines for home use',
        'french press for home brewing',
        'aeropress for home brewing',
        'high-quality coffee makers for home',
        'manual coffee grinders for home use',
        'best coffee brewing kits for home',

        // General Keywords
        'buy coffee equipment online',
        'coffee brewing gear for home and travel',
        'versatile coffee brewing equipment',
        'affordable coffee equipment',
        'top-rated coffee equipment for home and camping',

        // New Zealand Targeted Keywords
        'buy coffee equipment online in New Zealand',
        'coffee brewing tools in New Zealand',
        'high-quality coffee makers for New Zealand customers',
        'best coffee gear for Kiwi coffee lovers'
    ]
};

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang='en'>
            <head>
                <meta name='theme-color' content='#42413D'></meta>

                <Script async src='https://www.googletagmanager.com/gtag/js?id=G-HPCV2RWBFK'></Script>

                <Script id='google-analytics'>
                    {`window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-HPCV2RWBFK');`}
                </Script>

                <Script id='tawk' strategy='lazyOnload'>
                    {`
          var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();

          // Function to check if current page is coffee-ai
          function isOnCoffeeAIPage() {
            return window.location.pathname === '/coffee-ai' ||
                   window.location.pathname.startsWith('/coffee-ai/');
          }

          // Function to hide/show Tawk widget
          function toggleTawkWidget() {
            if (typeof Tawk_API !== 'undefined' && Tawk_API.hideWidget && Tawk_API.showWidget) {
              if (isOnCoffeeAIPage()) {
                Tawk_API.hideWidget();
              } else {
                Tawk_API.showWidget();
              }
            }
          }

          // Initialize Tawk
          (function(){
          var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
          s1.async=true;
          s1.src='https://embed.tawk.to/679aa20a825083258e0d4050/1iiq0hv3h';
          s1.charset='UTF-8';
          s1.setAttribute('crossorigin','*');
          s0.parentNode.insertBefore(s1,s0);
          })();

          // Custom styling of Offset starts here
          Tawk_API.customStyle = {
            visibility: {
              //for desktop only
              desktop: {
                position: 'br', // bottom-left
                xOffset: 20, // 15px away from left
                yOffset: 50 // 40px up from bottom
              },
              // for mobile only
              mobile: {
                position: 'br', // bottom-left
                xOffset: 5, // 5px away from left
                yOffset: 76 // 50px up from bottom
              },
              // change settings of bubble if necessary
              bubble: {
                rotate: '0deg',
                xOffset: -20,
                yOffset: 0
              }
            }
          };

          // Hide widget on coffee-ai page after Tawk loads
          Tawk_API.onLoad = function(){
            toggleTawkWidget();

            // Make Tawk widget draggable
            setTimeout(function() {
              makeTawkDraggable();
            }, 1000);

            // Listen for route changes (for client-side navigation)
            let currentPath = window.location.pathname;
            const observer = new MutationObserver(function() {
              if (currentPath !== window.location.pathname) {
                currentPath = window.location.pathname;
                setTimeout(toggleTawkWidget, 100); // Small delay to ensure route change is complete
              }
            });

            // Start observing changes to the document
            observer.observe(document, { childList: true, subtree: true });

            // Also listen to popstate for back/forward navigation
            window.addEventListener('popstate', function() {
              setTimeout(toggleTawkWidget, 100);
            });
          };

          // Function to make Tawk widget draggable
          function makeTawkDraggable() {
            console.log('Attempting to make Tawk draggable...');

            // More aggressive search for Tawk elements
            let tawkElement = null;
            let attempts = 0;

            function findTawkElement() {
              attempts++;
              console.log('Search attempt:', attempts);

              // Try multiple selectors
              const selectors = [
                'div[id*="tawk"]',
                'iframe[src*="tawk.to"]',
                'div[style*="position: fixed"][style*="bottom"]',
                'div[style*="z-index: 1000"]',
                '.widget-visible'
              ];

              for (let selector of selectors) {
                const elements = document.querySelectorAll(selector);
                console.log('Found elements for selector', selector, ':', elements.length);

                for (let element of elements) {
                  // Check if this looks like a Tawk widget
                  if (element.innerHTML && (
                    element.innerHTML.includes('tawk') ||
                    element.innerHTML.includes('chat') ||
                    element.getAttribute('src')?.includes('tawk')
                  )) {
                    tawkElement = element;
                    console.log('Found Tawk element:', element);
                    break;
                  }
                }
                if (tawkElement) break;
              }

              // If still not found, try looking at all fixed position elements
              if (!tawkElement) {
                const fixedElements = document.querySelectorAll('*');
                for (let element of fixedElements) {
                  const computedStyle = window.getComputedStyle(element);
                  if (computedStyle.position === 'fixed' &&
                      (computedStyle.bottom === '0px' || computedStyle.bottom.includes('px')) &&
                      element.offsetWidth < 200 && element.offsetHeight < 200) {
                    console.log('Potential Tawk element by position:', element);
                    tawkElement = element;
                    break;
                  }
                }
              }

              if (tawkElement) {
                console.log('Making element draggable:', tawkElement);
                addDragFunctionality(tawkElement);
              } else if (attempts < 10) {
                setTimeout(findTawkElement, 1000);
              } else {
                console.log('Could not find Tawk element after 10 attempts');
              }
            }

            findTawkElement();
          }

          function addDragFunctionality(element) {
            if (!element || element.classList.contains('tawk-draggable')) return;

            console.log('Adding drag functionality to:', element);

            element.classList.add('tawk-draggable');

            // Create a draggable handle overlay
            const dragHandle = document.createElement('div');
            dragHandle.style.cssText = \`
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 30px;
              background: rgba(66, 65, 61, 0.1);
              cursor: move;
              z-index: 999999;
              border-radius: 50px 50px 0 0;
              opacity: 0;
              transition: opacity 0.2s;
            \`;

            dragHandle.addEventListener('mouseenter', () => {
              dragHandle.style.opacity = '0.7';
            });

            dragHandle.addEventListener('mouseleave', () => {
              dragHandle.style.opacity = '0';
            });

            // Position the parent element relatively so we can add the handle
            element.style.position = 'fixed';
            element.appendChild(dragHandle);

            let isDragging = false;
            let currentX, currentY, initialX, initialY;
            let xOffset = 0, yOffset = 0;

            dragHandle.addEventListener('mousedown', dragStart);
            dragHandle.addEventListener('touchstart', dragStart);

            document.addEventListener('mouseup', dragEnd);
            document.addEventListener('touchend', dragEnd);
            document.addEventListener('mousemove', drag);
            document.addEventListener('touchmove', drag);

            function dragStart(e) {
              console.log('Drag start');
              e.preventDefault();
              e.stopPropagation();

              if (e.type === 'touchstart') {
                initialX = e.touches[0].clientX - xOffset;
                initialY = e.touches[0].clientY - yOffset;
              } else {
                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;
              }

              isDragging = true;
              dragHandle.style.opacity = '0.9';
              document.body.style.userSelect = 'none';
            }

            function dragEnd(e) {
              console.log('Drag end');
              initialX = currentX;
              initialY = currentY;
              isDragging = false;
              dragHandle.style.opacity = '0';
              document.body.style.userSelect = '';
            }

            function drag(e) {
              if (isDragging) {
                e.preventDefault();
                e.stopPropagation();

                if (e.type === 'touchmove') {
                  currentX = e.touches[0].clientX - initialX;
                  currentY = e.touches[0].clientY - initialY;
                } else {
                  currentX = e.clientX - initialX;
                  currentY = e.clientY - initialY;
                }

                xOffset = currentX;
                yOffset = currentY;

                // Keep within viewport bounds
                const rect = element.getBoundingClientRect();
                const maxX = window.innerWidth - rect.width;
                const maxY = window.innerHeight - rect.height;

                xOffset = Math.max(0, Math.min(maxX, xOffset));
                yOffset = Math.max(0, Math.min(maxY, yOffset));

                element.style.transform = 'translate(' + xOffset + 'px, ' + yOffset + 'px)';
                element.style.left = 'auto';
                element.style.right = 'auto';
                element.style.bottom = 'auto';
              }
            }

            console.log('Drag functionality added successfully');
          }
          `}
                </Script>
            </head>
            <body className={`${primaryFont.variable} ${secondaryFont.variable}`}>
                <OrganizationSchema />
                <ReduxProvider>
                    <TRPCProvider>
                        <ClerkProvider>{children}</ClerkProvider>
                    </TRPCProvider>
                </ReduxProvider>
            </body>
        </html>
    );
}
